'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Eye, 
  ThumbsUp, 
  Star, 
  Share2, 
  MessageSquare, 
  Coins,
  Play
} from 'lucide-react';

// 数字格式化函数
function formatNumber(num: number): string {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '亿';
  }
  if (num >= 100000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toLocaleString();
}

// 热门视频类型
interface HotVideo {
  bvid: string;
  title: string;
  cover: string;
  author: string;
  category: string;
  duration: number;
  publishTime: string;
  statistics: {
    views: number;
    likes: number;
    coins: number;
    favorites: number;
    shares: number;
    comments: number;
    danmaku: number;
  };
  engagementRate: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    videos: HotVideo[];
    total: number;
  };
  error?: string;
}

export default function BilibiliAnalysis() {
  const [videos, setVideos] = useState<HotVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<HotVideo | null>(null);

  useEffect(() => {
    fetchHotVideos();
  }, []);

  const fetchHotVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/bilibili/hot');
      const data: ApiResponse = await response.json();

      if (data.success) {
        setVideos(data.data.videos);
        setSelectedVideo(data.data.videos[0] || null);
      } else {
        setError(data.error || '获取数据失败');
      }
    } catch (err) {
      setError('网络请求失败，请稍后重试');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 统计卡片组件
  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    color 
  }: { 
    icon: React.ElementType; 
    label: string; 
    value: number; 
    color: string;
  }) => (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-card border">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{formatNumber(value)}</p>
      </div>
    </div>
  );

  // 饼图数据生成
  const getPieChartData = (video: HotVideo) => [
    { name: '播放', value: video.statistics.views, color: '#36cfc9' },
    { name: '点赞', value: video.statistics.likes, color: '#ff7875' },
    { name: '硬币', value: video.statistics.coins, color: '#ffd666' },
    { name: '收藏', value: video.statistics.favorites, color: '#b37feb' },
    { name: '分享', value: video.statistics.shares, color: '#73d13d' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-pink-950/20 dark:via-background dark:to-blue-950/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Bilibili 热门视频分析</h1>
                <p className="text-sm text-muted-foreground">实时数据 · 直观展示</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
              实时数据
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : error ? (
          <Card className="p-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button 
              onClick={fetchHotVideos}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              重试
            </button>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* 左侧：视频列表 */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>热门视频 TOP 20</CardTitle>
                  <CardDescription>点击查看详情</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                  {videos.slice(0, 20).map((video, index) => (
                    <div
                      key={video.bvid}
                      onClick={() => setSelectedVideo(video)}
                      className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-accent ${
                        selectedVideo?.bvid === video.bvid ? 'bg-accent ring-2 ring-primary' : ''
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={video.cover}
                          alt={video.title}
                          className="w-28 h-16 object-cover rounded"
                        />
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                          {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="absolute top-1 left-1 bg-pink-500 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                          #{index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2 mb-1">
                          {video.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {video.author}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {formatNumber(video.statistics.views)}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {video.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* 右侧：详情和图表 */}
            <div className="lg:col-span-2 space-y-6">
              {selectedVideo && (
                <>
                  {/* 视频基本信息 */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-2">{selectedVideo.title}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <img 
                                src={selectedVideo.cover.replace('/@220w_140h', '')} 
                                alt=""
                                className="w-6 h-6 rounded-full"
                              />
                              {selectedVideo.author}
                            </span>
                            <Badge>{selectedVideo.category}</Badge>
                            <span>BV: {selectedVideo.bvid}</span>
                          </div>
                        </div>
                        <a 
                          href={`https://www.bilibili.com/video/${selectedVideo.bvid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          播放
                        </a>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* 核心数据 */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                      icon={Eye}
                      label="播放量"
                      value={selectedVideo.statistics.views}
                      color="bg-blue-100 text-blue-600"
                    />
                    <StatCard
                      icon={ThumbsUp}
                      label="点赞数"
                      value={selectedVideo.statistics.likes}
                      color="bg-pink-100 text-pink-600"
                    />
                    <StatCard
                      icon={Star}
                      label="收藏数"
                      value={selectedVideo.statistics.favorites}
                      color="bg-purple-100 text-purple-600"
                    />
                    <StatCard
                      icon={Coins}
                      label="硬币数"
                      value={selectedVideo.statistics.coins}
                      color="bg-yellow-100 text-yellow-600"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                      icon={Share2}
                      label="分享数"
                      value={selectedVideo.statistics.shares}
                      color="bg-green-100 text-green-600"
                    />
                    <StatCard
                      icon={MessageSquare}
                      label="评论数"
                      value={selectedVideo.statistics.comments}
                      color="bg-orange-100 text-orange-600"
                    />
                    <StatCard
                      icon={Play}
                      label="弹幕数"
                      value={selectedVideo.statistics.danmaku}
                      color="bg-cyan-100 text-cyan-600"
                    />
                    <StatCard
                      icon={ThumbsUp}
                      label="互动率"
                      value={selectedVideo.engagementRate}
                      color="bg-indigo-100 text-indigo-600"
                    />
                  </div>

                  {/* 图表展示 */}
                  <Tabs defaultValue="bar" className="w-full">
                    <TabsList>
                      <TabsTrigger value="bar">柱状图</TabsTrigger>
                      <TabsTrigger value="radar">雷达图</TabsTrigger>
                      <TabsTrigger value="pie">占比图</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="bar">
                      <Card>
                        <CardHeader>
                          <CardTitle>核心指标对比</CardTitle>
                          <CardDescription>播放、点赞、收藏、硬币数据对比</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {/* 播放量 */}
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="flex items-center gap-2">
                                  <Eye className="w-4 h-4 text-blue-500" />
                                  播放量
                                </span>
                                <span>{formatNumber(selectedVideo.statistics.views)}</span>
                              </div>
                              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 rounded-full transition-all"
                                  style={{ width: '100%' }}
                                />
                              </div>
                            </div>
                            
                            {/* 点赞 */}
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="flex items-center gap-2">
                                  <ThumbsUp className="w-4 h-4 text-pink-500" />
                                  点赞
                                </span>
                                <span>{formatNumber(selectedVideo.statistics.likes)}</span>
                              </div>
                              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-pink-500 rounded-full transition-all"
                                  style={{ width: `${(selectedVideo.statistics.likes / selectedVideo.statistics.views) * 100}%` }}
                                />
                              </div>
                            </div>

                            {/* 收藏 */}
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="flex items-center gap-2">
                                  <Star className="w-4 h-4 text-purple-500" />
                                  收藏
                                </span>
                                <span>{formatNumber(selectedVideo.statistics.favorites)}</span>
                              </div>
                              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-purple-500 rounded-full transition-all"
                                  style={{ width: `${(selectedVideo.statistics.favorites / selectedVideo.statistics.views) * 100}%` }}
                                />
                              </div>
                            </div>

                            {/* 硬币 */}
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="flex items-center gap-2">
                                  <Coins className="w-4 h-4 text-yellow-500" />
                                  硬币
                                </span>
                                <span>{formatNumber(selectedVideo.statistics.coins)}</span>
                              </div>
                              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-yellow-500 rounded-full transition-all"
                                  style={{ width: `${(selectedVideo.statistics.coins / selectedVideo.statistics.views) * 100}%` }}
                                />
                              </div>
                            </div>

                            {/* 分享 */}
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="flex items-center gap-2">
                                  <Share2 className="w-4 h-4 text-green-500" />
                                  分享
                                </span>
                                <span>{formatNumber(selectedVideo.statistics.shares)}</span>
                              </div>
                              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-500 rounded-full transition-all"
                                  style={{ width: `${(selectedVideo.statistics.shares / selectedVideo.statistics.views) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="radar">
                      <Card>
                        <CardHeader>
                          <CardTitle>多维度数据雷达</CardTitle>
                          <CardDescription>从多个维度展示视频的各项指标</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { label: '播放', value: selectedVideo.statistics.views, max: selectedVideo.statistics.views, color: 'bg-blue-500' },
                              { label: '点赞', value: selectedVideo.statistics.likes, max: selectedVideo.statistics.views, color: 'bg-pink-500' },
                              { label: '收藏', value: selectedVideo.statistics.favorites, max: selectedVideo.statistics.views, color: 'bg-purple-500' },
                              { label: '硬币', value: selectedVideo.statistics.coins, max: selectedVideo.statistics.views, color: 'bg-yellow-500' },
                              { label: '分享', value: selectedVideo.statistics.shares, max: selectedVideo.statistics.views, color: 'bg-green-500' },
                              { label: '评论', value: selectedVideo.statistics.comments, max: selectedVideo.statistics.views, color: 'bg-orange-500' },
                            ].map((item) => (
                              <div key={item.label} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>{item.label}</span>
                                  <span>{formatNumber(item.value)}</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${item.color} rounded-full transition-all`}
                                    style={{ width: `${(item.value / item.max) * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="pie">
                      <Card>
                        <CardHeader>
                          <CardTitle>数据占比分布</CardTitle>
                          <CardDescription>各项数据占总数据的比例</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {getPieChartData(selectedVideo).map((item) => {
                              const total = getPieChartData(selectedVideo).reduce((sum, i) => sum + i.value, 0);
                              const percentage = ((item.value / total) * 100).toFixed(2);
                              return (
                                <div key={item.name} className="flex items-center gap-4">
                                  <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                                  <span className="w-16 text-sm">{item.name}</span>
                                  <div className="flex-1">
                                    <div className="h-6 bg-secondary rounded-full overflow-hidden">
                                      <div 
                                        className="h-full rounded-full transition-all flex items-center justify-end pr-2 text-xs text-white font-medium"
                                        style={{ 
                                          width: `${Math.max(Number(percentage), 2)}%`,
                                          backgroundColor: item.color 
                                        }}
                                      >
                                        {percentage}%
                                      </div>
                                    </div>
                                  </div>
                                  <span className="w-20 text-sm text-right">{formatNumber(item.value)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  {/* 互动分析 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>互动分析</CardTitle>
                      <CardDescription>视频互动数据深度解读</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="p-4 bg-pink-50 dark:bg-pink-950/20 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">点赞率</p>
                          <p className="text-2xl font-bold text-pink-600">
                            {((selectedVideo.statistics.likes / selectedVideo.statistics.views) * 100).toFixed(2)}%
                          </p>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">收藏率</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {((selectedVideo.statistics.favorites / selectedVideo.statistics.views) * 100).toFixed(2)}%
                          </p>
                        </div>
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">投币率</p>
                          <p className="text-2xl font-bold text-yellow-600">
                            {((selectedVideo.statistics.coins / selectedVideo.statistics.views) * 100).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <p className="text-sm">
                          <strong>综合互动率：</strong>
                          <span className="text-primary font-bold ml-2">{selectedVideo.engagementRate}%</span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          互动率 = (点赞 + 收藏 + 硬币) / 播放量 × 100%，是衡量视频受欢迎程度的重要指标
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          数据来源：Bilibili 官方 API · 仅供学习交流使用
        </div>
      </footer>
    </div>
  );
}
