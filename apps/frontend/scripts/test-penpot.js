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
		console.log(`Response for ${command}:`, JSON.stringify(data, null, 2));
	} catch (err) {
		console.error(`Error for ${command}:`, err.message);
	}
}

await testEndpoint("get-profile");
await testEndpoint("list-projects");
await testEndpoint("list-teams");
await testEndpoint("get-workspaces");
