#!/usr/bin/env bash
# Runs the agent-attest -> recipient-submit step against a chain already seeded by
# `forge script script/DemoSeed.s.sol --broadcast`. Done with real sequential `cast send`
# calls (not baked into the Foundry script) because EAS's attestation UID depends on
# block.timestamp, which differs between forge script's simulation pass and the real
# broadcast — a UID computed during simulation won't match the one actually minted on-chain.
set -euo pipefail

RPC=${RPC_URL:-http://127.0.0.1:8545}
EAS=${1:?usage: seed-demo.sh <EAS_ADDRESS> <VAULT_ADDRESS> <SCHEMA_UID> <RECIPIENT_ADDRESS>}
VAULT=${2:?}
SCHEMA_UID=${3:?}
RECIPIENT=${4:?}

AGENT_PK=0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
RECIPIENT_PK=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

echo "Agent posting attestation for tranche 0..."
TX=$(cast send "$EAS" \
  "attest((bytes32,(address,uint64,bool,bytes32,bytes,uint256)))(bytes32)" \
  "($SCHEMA_UID,($RECIPIENT,0,true,0x0000000000000000000000000000000000000000000000000000000000000000,$(cast abi-encode "f(string,uint8,string)" "Shipped v1, deployed to production" 94 "ipfs://demo-evidence"),0))" \
  --rpc-url "$RPC" --private-key "$AGENT_PK" --json)

TXHASH=$(echo "$TX" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).transactionHash))")
ATT_UID=$(cast receipt "$TXHASH" --rpc-url "$RPC" --json | node -e "
let d='';process.stdin.on('data',c=>d+=c);
process.stdin.on('end',()=>{
  const r = JSON.parse(d);
  const log = r.logs.find(l => l.topics.length === 4); // Attested(recipient,attester,uid,schemaUID indexed x3 + data)
  console.log(log.data);
});
")

echo "Attestation UID: $ATT_UID"

echo "Recipient submitting attestation to vault..."
cast send "$VAULT" "submitAttestation(uint256,bytes32)" 0 "$ATT_UID" \
  --rpc-url "$RPC" --private-key "$RECIPIENT_PK" > /dev/null

echo "Done. Tranche 0 is now Attested; dispute window is running."
