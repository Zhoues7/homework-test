import { NextRequest, NextResponse } from 'next/server';

// Bilibili API endpoint
const BILIBILI_API = 'https://api.bilibili.com/x/web-interface/view';

interface BilibiliVideoDetail {
  bvid: string;
  title: string;
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
  desc: string;
  duration: number;
  pubdate: number;
  tname: string;
  pic: string;
}

interface BilibiliApiResponse {
  code: number;
  message: string;
  data: BilibiliVideoDetail;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const bvid = searchParams.get('bvid');

  if (!bvid) {
    return NextResponse.json(
      { error: '请提供视频BV号 (bvid参数)' },
      { status: 400 }
    );
  }

  try {
    // 调用Bilibili官方API获取视频详情
    const response = await fetch(`${BILIBILI_API}?bvid=${bvid}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.bilibili.com',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: BilibiliApiResponse = await response.json();

    if (data.code !== 0) {
      return NextResponse.json(
        { error: data.message || '获取视频信息失败' },
        { status: 404 }
      );
    }

    // 格式化返回数据
    const videoData = {
      success: true,
      data: {
        bvid: data.data.bvid,
        title: data.data.title,
        description: data.data.desc,
        duration: data.data.duration,
        publishTime: new Date(data.data.pubdate * 1000).toISOString(),
        category: data.data.tname,
        cover: data.data.pic,
        author: {
          name: data.data.owner.name,
          avatar: data.data.owner.face,
        },
        statistics: {
          views: data.data.stat.view,
          likes: data.data.stat.like,
          coins: data.data.stat.coin,
          favorites: data.data.stat.favorite,
          shares: data.data.stat.share,
          comments: data.data.stat.reply,
          danmaku: data.data.stat.danmaku,
        },
        engagementRate: calculateEngagementRate(data.data.stat),
      },
    };

    return NextResponse.json(videoData);
  } catch (error) {
    console.error('Error fetching Bilibili video:', error);
    return NextResponse.json(
      { error: '获取视频信息失败，请检查BV号是否正确' },
      { status: 500 }
    );
  }
}

// 计算互动率 (点赞 + 收藏 + 硬币) / 播放量
function calculateEngagementRate(stat: BilibiliVideoDetail['stat']): number {
  if (stat.view === 0) return 0;
  const engagement = stat.like + stat.favorite + stat.coin;
  return Number((engagement / stat.view * 100).toFixed(2));
}
