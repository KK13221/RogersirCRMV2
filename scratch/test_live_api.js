async function run() {
  try {
    console.log("Fetching companies...");
    const compRes = await fetch("https://app6.lmh-ai.in/gbtbackend/api/companies.php");
    const compData = await compRes.json();
    console.log("Companies count:", compData.count);
    console.log("Companies list:");
    if (compData.data) {
      compData.data.forEach(c => {
        console.log(`- ID: ${c.id}, Name: ${c.company_name}, Admin URL: ${c.admin_url}`);
      });
    }

    console.log("\nFetching customer live dashboard data with debug...");
    const liveRes = await fetch("https://app6.lmh-ai.in/gbtbackend/api/customer_live.php?debug=1");
    const liveData = await liveRes.json();
    console.log("Success:", liveData.success);
    console.log("Total rows:", liveData.total);
    console.log("Data rows:");
    if (liveData.data) {
      liveData.data.forEach(r => {
        console.log(`- Customer: ${r.customer}, ActiveAtStart: ${r.activeAtStart}, ServerStatus: ${r.serverStatus}, Source: ${r.liveSource}`);
        console.log(`  Raw counts:`, r.rawCounts);
      });
    }
    if (liveData.debug) {
      console.log("\nDebug output:");
      console.log(JSON.stringify(liveData.debug, null, 2));
    }
  } catch (err) {
    console.error("Error fetching:", err);
  }
}

run();
