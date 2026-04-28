// 友情链接数据配置
// 用于管理友情链接页面的数据

export interface FriendItem {
	id: number;
	title: string;
	imgurl: string;
	desc: string;
	siteurl: string;
	tags: string[];
}

// 友情链接数据
export const friendsData: FriendItem[] = [
	{
		id: 9,
		title: "AcoFork Blog",
		imgurl: "https://q2.qlogo.cn/headimg_dl?dst_uin=2726730791&spec=0",
		desc: "Protect What you love",
		siteurl: "https://blog.acofork.com",
		tags: ["Blog"],
	},
	{
		id: 10,
		title: "叶子のBlog",
		imgurl: "https://q2.qlogo.cn/headimg_dl?dst_uin=319213657&spec=0",
		desc: "饭多伤胃，话多伤心",
		siteurl: "https://blog.goshujin.top/",
		tags: ["Blog"],
	},
	{
		id: 11,
		title: "小白のBlog",
		imgurl: "https://r2cfimg.showby.top/2024/09/19/66eb06a884fb9.jpg",
		desc: "Ciallo～(∠・ω< )⌒★",
		siteurl: "https://www.showby.top/",
		tags: ["Blog"],
	},
	{
		id: 12,
		title: "Arcwolf 希沃使用指南",
		imgurl: "https://arcwolf.top/assets/home/28.png",
		desc: "适用于电教委的希沃使用指南",
		siteurl: "https://wiki.arcwolf.top",
		tags: ["Blog"],
	},
	{
		id: 13,
		title: "Yourlai Blog",
		imgurl: "https://cdn.cdn.yourlai.com/img/logo/ava.png",
		desc: "无 bug 是理想，调设备是日常",
		siteurl: "https://yourlai.com",
		tags: ["Blog"],
	},
	{
		id: 14,
		title: "LynxCatTheThird",
		imgurl: "https://s2.hdslb.com/bfs/face/55653dbd3d6e3d685896bcd10242aa9585d28f56.jpg@1e_0c.webp",
		desc: "I am LynxCatTheThird, an AGI from the 103rd century.",
		siteurl: "https://www.lynx3.me/",
		tags: ["Blog"],
	},
	{
		id: 15,
		title: "安知鱼",
		imgurl: "https://npm.elemecdn.com/anzhiyu-blog-static@1.0.4/img/avatar.jpg",
		desc: "生活明朗，万物可爱",
		siteurl: "https://blog.anheyu.com/",
		tags: ["Blog"],
	},
	{
		id: 16,
		title: "彬红茶博客",
		imgurl: "https://blog.redcha.cn/favicon.ico",
		desc: "顶茶心 知识魂",
		siteurl: "https://blog.redcha.cn",
		tags: ["Blog"],
	},
	{
		id: 17,
		title: "Sukka's Blog",
		imgurl: "https://cdn.skk.moe/favicon/favicon-32x32.png",
		desc: "童话只美在真实却从不续写",
		siteurl: "https://skk.moe",
		tags: ["Blog"],
	},
	{
		id: 18,
		title: "爱吃可比克的鲸鱼",
		imgurl: "https://zxs24719.codeberg.page/avatar.jpg",
		desc: "",
		siteurl: "https://zxs24719.codeberg.page/",
		tags: ["Home"],
	},
	{
		id: 19,
		title: "AkiNard Blog",
		siteurl: "https://blog.578113.xyz",
		desc: "白云千载空悠悠.",
		imgurl: "https://q1.qlogo.cn/g?b=qq&nk=3833773438&s=640",
		tags: ["Blog"],
	},
];

// 获取所有友情链接数据
export function getFriendsList(): FriendItem[] {
	return friendsData;
}

// 获取随机排序的友情链接数据
export function getShuffledFriendsList(): FriendItem[] {
	const shuffled = [...friendsData];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}
