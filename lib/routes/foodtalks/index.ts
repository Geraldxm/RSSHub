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

    // 将records首先转换为简单list
    const list = records.map((item) => ({
        title: item.title,
        pubDate: new Date(item.publishTime),
        link: `https://www.foodtalks.cn/news/${item.id}`,
        author: item.sourceName,
        id: item.id,
        image: item.coverImg,
    }));

    // Data
    return {
        title: namespace.name,
        description: namespace.description,
        link: namespace.url,
        item: list,
    };
}

/*
record in records:
{
    id: 54596,
    title: '好望水照顾系列上新枸杞水；喜茶推
出补水纤体瓶 | 创新周报',
    language: null,
    coverImg: 'https://static.foodtalks.cn/image/post/43f2836e88d034c850e85eb10bb78dd5.png',
    summary: '我们每周将为您整理献上本周内食
品行业动态和最值得关注的资讯。',
    sourceType: 1,
    sourceId: 7632,
    sourceName: 'FBIF食品饮料创新',
    author: '',
    publishTime: '2024-11-25 17:52:01',
    parentTagCode: 'exclusives',
    tagCode: 'weekly',
    seoTitle: '好望水照顾系列上新枸杞水；喜茶
推出补水纤体瓶 | 创新周报-FoodTalks全球食品资
讯',
    seoKeywords: '好望水,喜茶,补水纤体瓶',
    score: null,
    status: null
  },
*/
