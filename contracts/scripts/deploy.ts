import { ethers, artifacts } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Starting deployment of CredentialVerifier...");

  // Get the contract factory
  const CredentialVerifier = await ethers.getContractFactory("CredentialVerifier");
  
  // Deploy the contract
  const verifier = await CredentialVerifier.deploy();
  await verifier.waitForDeployment();

  const address = await verifier.getAddress();
  console.log(`CredentialVerifier deployed to: ${address}`);

  // Write address and ABI to frontend
  const frontendLibDir = path.join(__dirname, "../../frontend/src/lib");
  // Also check non-src path just in case
  const fallbackFrontendLibDir = path.join(__dirname, "../../frontend/lib");
  
  const targetDir = fs.existsSync(path.join(__dirname, "../../frontend/src")) ? frontendLibDir : fallbackFrontendLibDir;

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const contractArtifact = await artifacts.readArtifact("CredentialVerifier");

  const contractDetails = {
    address: address,
    abi: contractArtifact.abi
  };

  const filePath = path.join(targetDir, "contractDetails.json");
  fs.writeFileSync(filePath, JSON.stringify(contractDetails, null, 2));

  console.log(`Contract details saved to: ${filePath}`);
  console.log("Deployment successful!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
