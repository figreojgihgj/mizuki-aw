((global) => {
	const cacheKey = "umami-share-cache";
	const cacheTTL = 3600_000; // 1h
	const tokenCacheKey = "umami-share-token";

	async function getToken(baseUrl, username, password) {
		const cached = localStorage.getItem(tokenCacheKey);
		if (cached) {
			try {
				const parsed = JSON.parse(cached);
				if (Date.now() - parsed.timestamp < cacheTTL) {
					return parsed.token;
				}
			} catch {
				localStorage.removeItem(tokenCacheKey);
			}
		}

		const res = await fetch(`${baseUrl}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username, password }),
		});

		if (!res.ok) {
			throw new Error("登录失败");
		}

		const data = await res.json();
		const token = data.token;

		localStorage.setItem(
			tokenCacheKey,
			JSON.stringify({ timestamp: Date.now(), token }),
		);

		return token;
	}

	async function makeRequest(url, baseUrl, username, password, apiKey) {
		let headers = {
			Accept: "application/json",
		};

		if (apiKey) {
			headers["x-umami-api-key"] = apiKey;
		} else if (username && password) {
			const token = await getToken(baseUrl, username, password);
			headers["Authorization"] = `Bearer ${token}`;
		}

		const res = await fetch(url, { headers });

		if (!res.ok) {
			throw new Error(`请求失败: ${res.status}`);
		}

		return await res.json();
	}

	async function fetchWebsiteStats(baseUrl, websiteId, username, password, apiKey) {
		const cached = localStorage.getItem(cacheKey);
		if (cached) {
			try {
				const parsed = JSON.parse(cached);
				if (Date.now() - parsed.timestamp < cacheTTL) {
					return parsed.value;
				}
			} catch {
				localStorage.removeItem(cacheKey);
			}
		}

		const currentTimestamp = Date.now();
		const statsUrl = `${baseUrl}/websites/${websiteId}/stats?startAt=0&endAt=${currentTimestamp}`;

		const stats = await makeRequest(statsUrl, baseUrl, username, password, apiKey);

		localStorage.setItem(
			cacheKey,
			JSON.stringify({ timestamp: Date.now(), value: stats }),
		);

		return stats;
	}

	async function fetchPageStats(
		baseUrl,
		websiteId,
		urlPath,
		username,
		password,
		apiKey,
		startAt = 0,
		endAt = Date.now(),
	) {
		const statsUrl = `${baseUrl}/websites/${websiteId}/stats?startAt=${startAt}&endAt=${endAt}&path=${encodeURIComponent(urlPath)}`;

		return await makeRequest(statsUrl, baseUrl, username, password, apiKey);
	}

	global.getUmamiWebsiteStats = async (
		baseUrl,
		websiteId,
		username,
		password,
		apiKey,
	) => {
		try {
			return await fetchWebsiteStats(
				baseUrl,
				websiteId,
				username,
				password,
				apiKey,
			);
		} catch (err) {
			throw new Error(`获取Umami统计数据失败: ${err.message}`);
		}
	};

	global.getUmamiPageStats = async (
		baseUrl,
		websiteId,
		urlPath,
		username,
		password,
		apiKey,
		startAt,
		endAt,
	) => {
		try {
			return await fetchPageStats(
				baseUrl,
				websiteId,
				urlPath,
				username,
				password,
				apiKey,
				startAt,
				endAt,
			);
		} catch (err) {
			throw new Error(`获取Umami页面统计数据失败: ${err.message}`);
		}
	};

	global.clearUmamiShareCache = () => {
		localStorage.removeItem(cacheKey);
		localStorage.removeItem(tokenCacheKey);
	};
})(window);

