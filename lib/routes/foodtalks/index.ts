import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache'; // 导入缓存工具
import { namespace } from './namespace';

export const route: Route = {
    path: '/',
    categories: ['new-media', 'journal'],
    example: '/foodtalks',
    radar: [
        {
            source: ['www.foodtalks.cn'],
        },
    ],
    name: 'FoodTalks global food information network',
    maintainers: ['Geraldxm'],
    handler,
    url: 'www.foodtalks.cn',
};

async function handler() {
    const url = 'https://api-we.foodtalks.cn/news/news/page?current=1&size=15&isLatest=1&language=ZH';
    const response = await ofetch(url, {
        headers: {
            referrer: 'https://www.foodtalks.cn/',
            method: 'GET',
        },
    });
    const records = response.data.records;

    // 获取除了全文的信息
    const list = records.map((item) => ({
        title: item.title,
        pubDate: new Date(item.publishTime),
        link: `https://www.foodtalks.cn/news/${item.id}`,
        category: item.parentTagCode === 'category' ? item.tagCode : item.parentTagCode,
        author: item.author === null ? item.sourceName : item.author,
        id: item.id,
        image: item.coverImg,
    }));

    // 获取全文
    const fullTextApi = 'https://api-we.foodtalks.cn/news/news/{id}?language=ZH';

    // 每个item是一个DataItem
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                // 尝试从缓存中获取数据
                const response = await ofetch(fullTextApi.replace('{id}', item.id), {
                    headers: {
                        referrer: 'https://www.foodtalks.cn/',
                        method: 'GET',
                    },
                });
                item.description = response.data.content;
                return item;
            })
        )
    );

    // 返回一个 Data
    return {
        title: namespace.name,
        description: namespace.description,
        link: 'https://' + namespace.url,
        item: items,
        image: 'https://www.foodtalks.cn/static/img/news-site-logo.7aaa5463.svg',
    };
}
