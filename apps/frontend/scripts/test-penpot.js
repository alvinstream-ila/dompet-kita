const token = process.env.PENPOT_TOKEN;
const baseUrl = "https://design.penpot.app/api/rpc/command";

async function testEndpoint(command) {
	console.log(`Testing command: ${command}`);
	try {
		const res = await fetch(`${baseUrl}/${command}`, {
			method: "POST",
			headers: {
				Authorization: `Token ${token}`,
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({}),
		});
		const data = await res.json();
		const sanitizedData = Array.isArray(data) 
			? data.map(item => sanitize(item)) 
			: sanitize(data);
		
		console.log(`Response for ${command}:`, JSON.stringify(sanitizedData, null, 2));
	} catch (err) {
		console.error(`Error for ${command}:`, err.message);
	}
}

function sanitize(obj) {
	if (!obj || typeof obj !== 'object') return obj;
	const sensitiveKeys = ['email', 'password', 'token', 'secret', 'key'];
	const sanitized = { ...obj };
	for (const key in sanitized) {
		if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
			sanitized[key] = '***MASKED***';
		} else if (typeof sanitized[key] === 'object') {
			sanitized[key] = sanitize(sanitized[key]);
		}
	}
	return sanitized;
}

await testEndpoint("get-profile");
await testEndpoint("list-projects");
await testEndpoint("list-teams");
await testEndpoint("get-workspaces");
