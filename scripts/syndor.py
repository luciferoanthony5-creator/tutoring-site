#!/usr/bin/env python3
"""Configure private, project-local Syndor identities and launch either agent."""

import argparse
import getpass
import json
import os
from pathlib import Path
import re
import shutil
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
PRIVATE = ROOT / ".syndor"


def setup(role):
    """Keep connector credentials out of shared or global configuration."""
    name = input("Exact MCP server name from this agent's Syndor setup prompt: ").strip()
    if not re.fullmatch(r"[A-Za-z0-9_-]+", name):
        raise SystemExit("Use the server name from Syndor (letters, digits, _ or -).")
    url = getpass.getpass("Private MCP connection URL (hidden): ").strip()
    parsed = urlsplit(url)
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
        raise SystemExit("Expected an HTTPS connector URL without embedded user/password fields.")
    other = PRIVATE / ("implementer.json" if role == "planner" else "planner.json")
    if other.exists() and json.loads(other.read_text())["url"] == url:
        raise SystemExit("Each agent needs its own connection URL; this belongs to the other role.")
    PRIVATE.mkdir(mode=0o700, exist_ok=True)
    os.chmod(PRIVATE, 0o700)
    path = PRIVATE / f"{role}.json"
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(descriptor, "w") as output:
        json.dump({"name": name, "url": url}, output)
    os.chmod(path, 0o600)
    print(f"Saved private {role} connection. No global settings changed.")


def launch(role):
    path = PRIVATE / f"{role}.json"
    if not path.exists():
        raise SystemExit(f"Run python3 scripts/syndor.py setup {role} first.")
    connection = json.loads(path.read_text())
    name, url = connection["name"], connection["url"]
    prompt = (ROOT / "docs" / "syndor" / f"{role}.md").read_text()
    if role == "planner":
        command = [
            "codex", "--model", "gpt-6-astra", "--sandbox", "read-only",
            "--ask-for-approval", "on-request",
            "-c", 'model_reasoning_effort="xhigh"',
            "-c", f"mcp_servers.{json.dumps(name)}.url={json.dumps(url)}",
            prompt,
        ]
    else:
        config = {"mcpServers": {name: {"type": "http", "url": url}}}
        # --mcp-config accepts multiple values; end options before the prompt.
        command = ["claude", "--mcp-config", json.dumps(config), "--", prompt]
    executable = shutil.which(command[0])
    if not executable:
        raise SystemExit(f"Install {command[0]} and sign in before launching.")
    os.chdir(ROOT)
    os.execv(executable, command)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["setup", "start"])
    parser.add_argument("role", choices=["planner", "implementer"])
    args = parser.parse_args()
    if args.action == "setup":
        setup(args.role)
    else:
        launch(args.role)


if __name__ == "__main__":
    main()
