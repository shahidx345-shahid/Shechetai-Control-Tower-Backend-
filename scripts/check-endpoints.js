// Using native fetch (Node 18+)

async function checkEndpoint(url, method = 'GET') {
    try {
        console.log(`Checking ${method} ${url}...`);
        const res = await fetch(url, {
            method: method,
            headers: {
                'Authorization': 'Bearer dummy_token',
                'Content-Type': 'application/json'
            },
            body: method === 'POST' ? '{}' : undefined
        });
        console.log(`Status: ${res.status} ${res.statusText}`);
        return res.status;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return null;
    }
}

async function run() {
    const PROD = "https://hooks.shechet.com";

    console.log("--- PROD TEAMS HUNT ---");

    // Try variations for listing teams
    await checkEndpoint(`${PROD}/_config/teams`);
    await checkEndpoint(`${PROD}/_config/teams.list`);
    await checkEndpoint(`${PROD}/_config/list_teams`);
    await checkEndpoint(`${PROD}/_config/getTeams`);
    await checkEndpoint(`${PROD}/_config/teams/list`);
    await checkEndpoint(`${PROD}/_config/teams.all`);
    await checkEndpoint(`${PROD}/_config/teams.index`);
    await checkEndpoint(`${PROD}/_config/my-teams`);
    await checkEndpoint(`${PROD}/_config/user/teams`);

    // Try POST for listing
    await checkEndpoint(`${PROD}/_config/teams.list`, 'POST');
    await checkEndpoint(`${PROD}/_config/list-teams`, 'POST');
}

run();
