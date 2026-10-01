const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const Verifier = await hre.ethers.getContractFactory("CredentialVerifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();

  const address = await verifier.getAddress();
  console.log("CredentialVerifier deployed to:", address);

  // Export contract address and ABI directly to the frontend
  const frontendDir = path.join(__dirname, "../../frontend/lib");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  const contractArtifact = await hre.artifacts.readArtifact("CredentialVerifier");
  const details = {
    address: address,
    abi: contractArtifact.abi,
  };

  fs.writeFileSync(
    path.join(frontendDir, "contractDetails.json"),
    JSON.stringify(details, null, 2)
  );
  console.log("Saved contract details to frontend/lib/contractDetails.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});