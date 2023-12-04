/* eslint-disable linebreak-style */
/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable linebreak-style */
// react
import React, { useEffect, useMemo, useState } from "react";
// third-party
import { useIntl } from 'react-intl';
// application
import firebase from 'firebase';
import BlockBanners from '~/components/blocks/BlockBanners';
import BlockBrands from '~/components/blocks/BlockBrands';
import BlockFeatures from '~/components/blocks/BlockFeatures';
import BlockFinder from '~/components/blocks/BlockFinder';
import BlockPosts from '~/components/blocks/BlockPosts';
import BlockProductsCarousel from '~/components/blocks/BlockProductsCarousel';
import BlockProductsColumns from '~/components/blocks/BlockProductsColumns';
import BlockAuction from '~/components/blocks/BlockAuction';
import BlockSpace from '~/components/blocks/BlockSpace';
import BlockZone from '~/components/blocks/BlockZone';
import url from '~/services/url';
import { shopApi, blogApi } from '~/api';
import { useDeferredData, useProductColumns, useProductTabs } from '~/services/hooks';
import BlockSlideshow from '~/components/blocks/BlockSlideshow';
import HeroHeader from '~/custom/components/heroHeader/HeroHeader';
import { IBrand } from '~/interfaces/brand';
import { brands } from '~/myData/brandsData';
import { getRealtimeProducts } from '~/services/firebase';

function Page() {
    const intl = useIntl();

    const slides = useMemo(
        () => [
            {
                url: '/find-cars',
                desktopImage:
                    'https://res.cloudinary.com/autogear/image/upload/c_crop,h_500,w_1350/v1621514394/Postors/jridteuujlsizggo3bmk.jpg',
                mobileImage:
                    'https://res.cloudinary.com/autogear/image/upload/c_crop,h_500,w_1350/v1621514394/Postors/jridteuujlsizggo3bmk.jpg',
                offer: 'Secure Auction',
                title: 'Bid your favourite car',
                details: 'Bid higher to win your favourite cars.',
                buttonLabel: 'Explore',
            },
            {
                url: '/find-cars',
                desktopImage:
                    'https://res.cloudinary.com/autogear/image/upload/c_crop,h_500,w_13500/v1621514877/Postors/pkeffh0mlmcp0c24sa1d.jpg',
                mobileImage:
                    'https://res.cloudinary.com/autogear/image/upload/c_crop,h_500,w_13500/v1621514877/Postors/pkeffh0mlmcp0c24sa1d.jpg',
                title: 'Featured Ad',
                offer: 'Boost Your Sales',
                details: 'App ly for Ad to rank up your products.',
                buttonLabel: 'Explore',
            },
            {
                url: '/find-cars',
                desktopImage:
                    'https://res.cloudinary.com/autogear/image/upload/c_crop,h_500,w_1350/v1621515129/Postors/krq0l5edphsnahqxstep.jpg',
                mobileImage:
                    'https://res.cloudinary.com/autogear/image/upload/c_crop,h_500,w_1350/v1621515129/Postors/krq0l5edphsnahqxstep.jpg',
                offer: 'Sell And Buy',
                title: 'Sell and buy your car',
                details: 'Sell your car and buy your avourite one.',
                buttonLabel: 'Explore',
            },
        ],
        [],
    );

    /**
     * Featured products.
     */
    const featuredProducts = useProductTabs(
        useMemo(
            () => [
                { id: 1, name: 'All', categorySlug: null },
                // { id: 2, name: "Power Tools", categorySlug: "power-tools" },
                // { id: 3, name: "Hand Tools", categorySlug: "hand-tools" },
                // { id: 4, name: "Plumbing", categorySlug: "plumbing" },
            ],
            [],
        ),
        (tab) => shopApi.getFeaturedProducts(tab.categorySlug, 8),
    );

    const blockSale = useDeferredData(() => shopApi.getSpecialOffers(8), []);

    const blockZones = useMemo(
        () => [
            {
                image: '/images/categories/category-overlay-1.jpg',
                mobileImage: '/images/categories/category-overlay-1-mobile.jpg',
                categorySlug: 'tires-wheels',
            },
            {
                image: '/images/categories/category-overlay-2.jpg',
                mobileImage: '/images/categories/category-overlay-2-mobile.jpg',
                categorySlug: 'interior-parts',
            },
            {
                image: '/images/categories/category-overlay-3.jpg',
                mobileImage: '/images/categories/category-overlay-3-mobile.jpg',
                categorySlug: 'engine-drivetrain',
            },
        ],
        [],
    );

    const newArrivals = useDeferredData(() => shopApi.getLatestProducts(12), []);
    const newArrivalsLinks = useMemo(
        () => [
            { title: 'Wheel Covers', url: url.products() },
            { title: 'Timing Belts', url: url.products() },
            { title: 'Oil Pans', url: url.products() },
            { title: 'Show All', url: url.products() },
        ],
        [],
    );

    const latestPosts = useDeferredData(() => blogApi.getLatestPosts(8), []);
    const latestPostsLinks = useMemo(
        () => [
            { title: 'Special Offers', url: url.blog() },
            { title: 'New Arrivals', url: url.blog() },
            { title: 'Reviews', url: url.blog() },
        ],
        [],
    );

    // const brands = useDeferredData(() => shopApi.getBrands({ limit: 16 }), []);

    /**
     * Product columns.
     */
    const columns = useProductColumns(
        useMemo(
            () => [
                {
                    title: 'Top Rated Products',
                    source: () => shopApi.getTopRatedProducts(null, 3),
                },
                {
                    title: 'Special Offers',
                    source: () => shopApi.getSpecialOffers(3),
                },
                {
                    title: 'Bestsellers',
                    source: () => shopApi.getPopularProducts(null, 3),
                },
            ],
            [],
        ),
    );

    useEffect(() => {
        const db = firebase.database();
        const ref = db.ref('/');
        ref.on(
            'value',
            (snapshot) => {
                console.log(snapshot.val());
                return snapshot.val();
            },
            (errorObject) => {
                console.log(errorObject);
                return undefined;
            },
        );
    }, []);

    return (
        <React.Fragment>
            <BlockFinder />

            {/* <HeroHeader/> */}
            <BlockSpace layout="divider-nl" />
            <BlockFeatures layout="top-strip" />
            <BlockSpace layout="divider-nl" />
            <BlockBrands layout="columns-8-full" brands={brands.slice(0, 16)} />
            <BlockSpace layout="divider-xs" />
            <BlockSlideshow slides={slides} />
            <BlockSpace layout="divider-nl" />
            <BlockProductsCarousel
                blockTitle={intl.formatMessage({ id: 'HEADER_FEATURED_PRODUCTS' })}
                layout="grid-5"
                loading={featuredProducts.isLoading}
                products={featuredProducts.data}
                groups={featuredProducts.tabs}
                currentGroup={featuredProducts.tabs.find((x) => x.current)}
                onChangeGroup={featuredProducts.handleTabChange}
            />
            <BlockSpace layout="divider-nl" />
            {/* <BlockAuction products={blockSale.data} loading={blockSale.isLoading} /> */}
            {/* <BlockSpace layout="divider-lg" /> */}

            {/* {blockZones.map((blockZone, blockZoneIdx) => (
                <React.Fragment key={blockZoneIdx}>
                    <BlockZone
                        image={blockZone.image}
                        mobileImage={blockZone.mobileImage}
                        categorySlug={blockZone.categorySlug}
                    />
                    {blockZoneIdx < blockZones.length - 1 && (
                        <BlockSpace layout="divider-sm" />
                    )}
                </React.Fragment>
            ))} */}

            {/* <BlockSpace layout="divider-nl" />
            <BlockBanners /> */}
            {/* <BlockSpace layout="divider-nl" /> */}
            {/* <BlockProductsCarousel
                blockTitle={intl.formatMessage({ id: 'HEADER_NEW_ARRIVALS' })}
                layout="horizontal"
                rows={2}
                loading={newArrivals.isLoading}
                products={newArrivals.data}
                links={newArrivalsLinks}
            /> */}
            <BlockSpace layout="divider-nl" />
            <BlockPosts
                blockTitle={intl.formatMessage({ id: 'HEADER_LATEST_NEWS' })}
                layout="grid"
                loading={latestPosts.isLoading}
                posts={latestPosts.data}
                links={latestPostsLinks}
            />

            <BlockSpace layout="divider-nl" className="d-xl-block d-none" />
            {/* <BlockProductsColumns columns={columns} /> */}
            <BlockSpace layout="before-footer" />
        </React.Fragment>
    );
}

export default Page;
