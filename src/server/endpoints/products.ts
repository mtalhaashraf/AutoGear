// application
import { AbstractFilterBuilder } from "~/server/filters/abstract-filter-builder";
import { CategoryFilterBuilder } from "~/server/filters/category-filter-builder";
import { CheckFilterBuilder } from "~/server/filters/check-filter-builder";
import { clone, delayResponse, error } from "~/server/utils";
import { ColorFilterBuilder } from "~/server/filters/color-filter-builder";
import { getNextReviewId, reviews } from "~/server/database/reviews";
import { IFilterValues, IListOptions, IReviewsList } from "~/interfaces/list";
import { IProductsList, IProduct } from "~/interfaces/product";
import { IReview } from "~/interfaces/review";
import { prepareCategory } from "~/server/endpoints/categories";
import { products as dbProducts } from "~/server/database/products";
import { RadioFilterBuilder } from "~/server/filters/radio-filter-builder";
import { RangeFilterBuilder } from "~/server/filters/range-filter-builder";
import { RatingFilterBuilder } from "~/server/filters/rating-filter-builder";
import { shopCategoriesList } from "~/server/database/categories";
import { VehicleFilterBuilder } from "~/server/filters/vehicle-filter-builder";
import { IAddProductReviewData, IGetSearchSuggestionsOptions, IGetSearchSuggestionsResult } from "~/api/base";
import axios from "axios";
import UserAuthService from "~/api-services/userService/UserAuthService";
import ProductService from "~/api-services/ProductService";
import ReviewService from "~/api-services/ReviewService";

function getProducts(shift: number, categorySlug: string | null = null): IProduct[] {
    let shiftValue = shift;

    switch (categorySlug) {
        case "tires-wheels":
        case "power-tools":
            shiftValue += 5;
            break;
        case "interior-parts":
        case "hand-tools":
            shiftValue += 10;
            break;
        case "engine-drivetrain":
        case "plumbing":
            shiftValue += 15;
            break;
        default:
    }

    return [...dbProducts.slice(shiftValue), ...dbProducts.slice(0, shiftValue)];
}

export async function getProductsList(
    options: IListOptions = {},
    filterValues: IFilterValues = {}
): Promise<IProductsList> {
    const filters: AbstractFilterBuilder[] = [
        new CategoryFilterBuilder("category", "Categories"),
        new VehicleFilterBuilder("vehicle", "Vehicle"),
        new RangeFilterBuilder("price", "Price"),
        new CheckFilterBuilder("brand", "Brand"),
        new RadioFilterBuilder("discount", "With Discount"),
        new RatingFilterBuilder("rating", "Rating"),
        new ColorFilterBuilder("color", "Color"),
    ];

    let products = dbProducts.slice(0);

    //Fetch your own products

    filters.forEach((filter) => filter.makeItems(products, filterValues[filter.slug]));

    // Calculate items count for filter values.
    filters.forEach((filter) => filter.calc(dbProducts, filters));

    // Apply filters to products list.
    products = products.filter((product) => filters.reduce<boolean>((mr, filter) => mr && filter.test(product), true));

    const page = options?.page || 1;
    const limit = options?.limit || 16;
    const sort = options?.sort || "default";
    const total = products.length;
    const pages = Math.ceil(products.length / limit);
    const from = (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);

    // Sort items array.
    products = products.sort((a, b) => {
        if (["name_asc", "name_desc"].includes(sort)) {
            if (a.name === b.name) {
                return 0;
            }

            return (a.name > b.name ? 1 : -1) * (sort === "name_asc" ? 1 : -1);
        }

        return 0;
    });

    const items = products.slice(from - 1, to) as unknown as Array<IProduct>;

    return delayResponse(
        Promise.resolve({
            items,
            page,
            limit,
            sort,
            total,
            pages,
            from,
            to,
            filters: filters.map((x) => x.build()),
        }),
        350
    );
}

export function getProductBySlug(slug: string): Promise<IProduct> {
    const product = dbProducts.find((x) => x.slug === slug);

    if (!product) {
        return error("Page Not Found");
    }

    return Promise.resolve(clone(product));
}

export const addProduct = (product: IProduct) => {};

export function getProductReviews(productId: string, options?: IListOptions): Promise<IReviewsList> {
    let items = reviews.slice(0);

    return ReviewService.getReviews(productId)
        .then((responseData) => responseData.data[0].reviews)
        .then((reviews) => {
            console.log(reviews);
            let records: IReview[] = reviews.map((review: any, index: number) => {
                const { name, email, content, rating, date } = review;
                const record: IReview = {
                    id: index,
                    author: name,
                    content: content,
                    avatar: `https://ui-avatars.com/api/?name=${email}`,
                    rating: rating,
                    date: date,
                };
                return record;
            });
            return records;
        })
        .then((items: IReview[]) => {
            items.sort((a, b) => {
                if (a.date > b.date) {
                    return -1;
                }
                if (a.date < b.date) {
                    return 1;
                }

                return 0;
            });

            const page = options?.page || 1;
            const limit = options?.limit || 8;
            const sort = options?.sort || "default";
            const total = items.length;
            const pages = Math.ceil(items.length / limit);
            const from = (page - 1) * limit + 1;
            const to = page * limit;

            items = items.slice(from - 1, to) as unknown as Array<IReview>;
            let reviewList: IReviewsList = {
                items,
                page,
                limit,
                sort,
                total,
                pages,
                from,
                to,
            };
            return reviewList;
        })
        .catch((error) => {
            console.log(error.response);
            let reviewList: IReviewsList = {
                items: [],
                page: 1,
                limit: 8,
                sort: "default",
                total: 0,
                pages: 1,
                from: 0,
                to: 0,
            };
            return reviewList;
        });
}

export function addProductReview(productId: string, data: IAddProductReviewData): Promise<IReview> {
    const { author, email, content, rating } = data;
    const date = new Date();
    const customData = {
        productId: productId,
        name: author,
        email,
        content,
        rating,
        date: `${date.getMonth() + 1}/${date.getDay()}/${date.getFullYear()}`,
    };
    return ReviewService.addReview(customData)
        .then((responseData) => responseData.data)
        .then((data) => data.reviews)
        .then((reviews) => {
            const review: IReview = {
                id: getNextReviewId(),
                author: author,
                avatar: `https://ui-avatars.com/api/?name=${email}`,
                content: content,
                date: customData.date,
                rating,
            };
            return review;
        })
        .catch((error) => {
            console.log(error.response);
            const review: IReview = {
                id: getNextReviewId(),
                author: author,
                avatar: `https://ui-avatars.com/api/?name=${email}`,
                content: content,
                date: customData.date,
                rating,
            };
            return review;
        });
    // const review: IReview = {
    //     id: getNextReviewId(),
    //     date: new Date().toISOString().substr(0, 10),
    //     author: data.author,
    //     avatar: "/images/avatars/avatar-2.jpg",
    //     rating: data.rating,
    //     content: data.content,
    // };

    // reviews.push(review);

    // return delayResponse(Promise.resolve(review));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getProductAnalogs(productId: string): Promise<IProduct[]> {
    const slugs: string[] = ["sunset-brake-kit", "specter-brake-kit", "brake-kit"];
    const analogs: IProduct[] = dbProducts.filter((x) => slugs.includes(x.slug));

    return Promise.resolve(clone(analogs));
}

export function getRelatedProducts(productId: string, limit: number): Promise<IProduct[]> {
    return Promise.resolve(clone(dbProducts.slice(0, limit)));
}

export function getFeaturedProducts(categorySlug: string | null, limit: number): Promise<IProduct[]> {
    return delayResponse(Promise.resolve(clone(getProducts(0, categorySlug).slice(0, limit))), 1000);
}

export function getPopularProducts(categorySlug: string | null, limit: number): Promise<IProduct[]> {
    return delayResponse(Promise.resolve(clone(getProducts(6, categorySlug).slice(0, limit))), 1000);
}

export function getTopRatedProducts(categorySlug: string | null, limit: number): Promise<IProduct[]> {
    return delayResponse(Promise.resolve(clone(getProducts(12, categorySlug).slice(0, limit))), 1000);
}

export function getSpecialOffers(limit: number): Promise<IProduct[]> {
    return delayResponse(Promise.resolve(clone(getProducts(8).slice(0, limit))), 1000);
}

export function getLatestProducts(limit: number): Promise<IProduct[]> {
    return Promise.resolve(clone(dbProducts.slice(0, limit)));
}

export function getSearchSuggestions(
    query: string,
    options?: IGetSearchSuggestionsOptions
): Promise<IGetSearchSuggestionsResult> {
    const queryVal = query.toLowerCase();
    const optionsVal = {
        limitProducts: 4,
        limitCategories: 4,
        ...options,
    };

    const resultProducts = dbProducts.filter((x) => x.name.toLowerCase().includes(queryVal));
    const resultCategories = shopCategoriesList.filter((x) => x.name.toLowerCase().includes(queryVal));

    return Promise.resolve({
        products: resultProducts.slice(0, optionsVal.limitProducts),
        categories: resultCategories.slice(0, optionsVal.limitCategories).map((x) => prepareCategory(x)),
    });
}
