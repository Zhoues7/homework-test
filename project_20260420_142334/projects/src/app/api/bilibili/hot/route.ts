import { NextRequest, NextResponse } from 'next/server';

// Bilibili 热门视频 API
const BILIBILI_HOT_API = 'https://api.bilibili.com/x/web-interface/ranking/v2';

interface BilibiliVideoItem {
  bvid: string;
  title: string;
  short_link_v2: string;
  owner: {
    name: string;
    face: string;
  };
  stat: {
    view: number;
    like: number;
    coin: number;
    favorite: number;
    share: number;
    reply: number;
    danmaku: number;
  };
  tname: string;
  pic: string;
  duration: number;
  pubdate: number;
}

interface BilibiliHotResponse {
  code: number;
  message: string;
  data: {
    list: BilibiliVideoItem[];
  };
}

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(BILIBILI_HOT_API, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.bilibili.com',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: BilibiliHotResponse = await response.json();

    if (data.code !== 0) {
      return NextResponse.json(
        { error: data.message || '获取热门视频失败' },
        { status: 500 }
      );
    }

    // 格式化返回数据
    const videos = data.data.list.map((video) => ({
      bvid: video.bvid,
      title: video.title,
      cover: video.pic,
      author: video.owner.name,
      category: video.tname,
      duration: video.duration,
      publishTime: new Date(video.pubdate * 1000).toISOString(),
      statistics: {
        views: video.stat.view,
        likes: video.stat.like,
        coins: video.stat.coin,
        favorites: video.stat.favorite,
        shares: video.stat.share,
        comments: video.stat.reply,
        danmaku: video.stat.danmaku,
      },
      engagementRate: video.stat.view > 0
        ? Number(((video.stat.like + video.stat.favorite + video.stat.coin) / video.stat.view * 100).toFixed(2))
        : 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        videos,
        total: videos.length,
      },
    });
  } catch (error) {
    console.error('Error fetching hot videos:', error);
    return NextResponse.json(
      { error: '获取热门视频失败' },
      { status: 500 }
    );
  }
}
