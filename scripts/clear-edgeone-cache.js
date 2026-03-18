#!/usr/bin/env node
/**
 * 腾讯云 EdgeOne 缓存清除脚本
 * 在构建完成后自动清除 EdgeOne CDN 缓存
 */

const https = require('https');
const crypto = require('crypto');

// 从环境变量获取配置
const SECRET_ID = process.env.TENCENT_SECRET_ID;
const SECRET_KEY = process.env.TENCENT_SECRET_KEY;
const ZONE_ID = process.env.TENCENT_EDGEONE_ZONE_ID;
const DOMAIN = process.env.TENCENT_EDGEONE_DOMAIN || 'arcwolf.top';

// 检查必要的环境变量
if (!SECRET_ID || !SECRET_KEY || !ZONE_ID) {
	console.log('⚠️  腾讯云 EdgeOne 缓存清除：未配置环境变量，跳过缓存清除');
	console.log('如需启用，请设置以下环境变量：');
	console.log('  - TENCENT_SECRET_ID');
	console.log('  - TENCENT_SECRET_KEY');
	console.log('  - TENCENT_EDGEONE_ZONE_ID');
	process.exit(0);
}

/**
 * 生成腾讯云 API 签名
 */
function generateSignature(payload, timestamp, date) {
	// 服务名称和主机
	const service = 'teo';
	const host = 'teo.tencentcloudapi.com';

	// 创建规范请求
	const httpRequestMethod = 'POST';
	const canonicalUri = '/';
	const canonicalQueryString = '';
	const contentType = 'application/json';

	// 创建请求头
	const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');
	const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-tc-action:PurgeCaches\n`;
	const signedHeaders = 'content-type;host;x-tc-action';

	// 创建规范请求
	const canonicalRequest = [
		httpRequestMethod,
		canonicalUri,
		canonicalQueryString,
		canonicalHeaders,
		signedHeaders,
		payloadHash,
	].join('\n');

	// 创建签名字符串
	const algorithm = 'TC3-HMAC-SHA256';
	const credentialScope = `${date}/${service}/tc3_request`;
	const hashedCanonicalRequest = crypto
		.createHash('sha256')
		.update(canonicalRequest)
		.digest('hex');
	const stringToSign = [
		algorithm,
		timestamp,
		credentialScope,
		hashedCanonicalRequest,
	].join('\n');

	// 计算签名
	const secretDate = crypto
		.createHmac('sha256', `TC3${SECRET_KEY}`)
		.update(date)
		.digest();
	const secretService = crypto
		.createHmac('sha256', secretDate)
		.update(service)
		.digest();
	const secretSigning = crypto
		.createHmac('sha256', secretService)
		.update('tc3_request')
		.digest();
	const signature = crypto
		.createHmac('sha256', secretSigning)
		.update(stringToSign)
		.digest('hex');

	// 创建授权头
	const authorization = `${algorithm} Credential=${SECRET_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

	return authorization;
}

/**
 * 发送 HTTP 请求
 */
function sendRequest(options, data) {
	return new Promise((resolve, reject) => {
		const req = https.request(options, (res) => {
			let responseData = '';
			res.on('data', (chunk) => {
				responseData += chunk;
			});
			res.on('end', () => {
				try {
					const parsed = JSON.parse(responseData);
					resolve(parsed);
				} catch (e) {
					resolve(responseData);
				}
			});
		});

		req.on('error', (error) => {
			reject(error);
		});

		if (data) {
			req.write(data);
		}
		req.end();
	});
}

/**
 * 清除 EdgeOne 缓存
 */
async function clearEdgeOneCache() {
	console.log('🚀 开始清除腾讯云 EdgeOne 缓存...');

	const timestamp = Math.floor(Date.now() / 1000);
	const date = new Date().toISOString().split('T')[0];

	// 构建请求体
	const payload = JSON.stringify({
		ZoneId: ZONE_ID,
		Type: 'purge_host',
		Targets: [DOMAIN],
	});

	// 生成签名
	const authorization = generateSignature(payload, timestamp, date);

	// 请求选项
	const options = {
		hostname: 'teo.tencentcloudapi.com',
		port: 443,
		path: '/',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Host': 'teo.tencentcloudapi.com',
			'X-TC-Action': 'PurgeCaches',
			'X-TC-Version': '2022-09-01',
			'X-TC-Timestamp': timestamp.toString(),
			'X-TC-Region': 'ap-guangzhou',
			'Authorization': authorization,
		},
	};

	try {
		const response = await sendRequest(options, payload);

		if (response.Response && response.Response.Error) {
			console.error('❌ 清除缓存失败:', response.Response.Error.Message);
			process.exit(1);
		} else if (response.Response && response.Response.JobId) {
			console.log('✅ 缓存清除任务已提交，JobId:', response.Response.JobId);
			console.log('⏳ 缓存清除可能需要几分钟生效');
		} else {
			console.log('⚠️  未知响应:', JSON.stringify(response, null, 2));
		}
	} catch (error) {
		console.error('❌ 请求失败:', error.message);
		process.exit(1);
	}
}

// 执行缓存清除
clearEdgeOneCache();
