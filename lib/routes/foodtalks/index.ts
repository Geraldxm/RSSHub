import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
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

// handler should return a Data object
async function handler() {
    const url = `https://api-we.foodtalks.cn/news/news/page?current=1&size=15&isLatest=1&language=ZH`;
    const response = await ofetch(url, {
        headers: {
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6,zh-TW;q=0.5',
            referrer: 'https://www.foodtalks.cn/',
            method: 'GET',
            mode: 'cors',
            credentials: 'omit',
        },
    });
    const records = response.data.records;

    // 获取除全为外的内容
    const list = records.map((item) => ({
        title: item.title,
        pubDate: new Date(item.publishTime),
        link: `https://www.foodtalks.cn/news/${item.id}`,
        author: item.sourceName,
        id: item.id,
        image: item.coverImg,
    }));

    // 获取全文
    const fullTextApi = 'https://api-we.foodtalks.cn/news/news/{id}?language=ZH';

    const items = await Promise.all(
        list.map(async (item) => {
            const response = await ofetch(fullTextApi.replace('{id}', item.id), {
                headers: {
                    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6,zh-TW;q=0.5',
                    referrer: 'https://www.foodtalks.cn/',
                    method: 'GET',
                    mode: 'cors',
                    credentials: 'omit',
                },
            });
            item.description = response.data.content;
            return item;
        })
    );

    // 返回一个 Data 对象
    return {
        title: namespace.name,
        description: namespace.description,
        link: namespace.url,
        item: items,
    };
}
