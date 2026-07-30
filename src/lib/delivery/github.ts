import type { DeliveryFile } from "./types";

interface GitHubPublishInput {
  owner: string;
  repository: string;
  branch: string;
  commitMessage: string;
  files: DeliveryFile[];
  token: string;
}

async function existingSha(input: GitHubPublishInput, path: string): Promise<string | undefined> {
  const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repository)}/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(input.branch)}`, {
    headers: { Authorization: `Bearer ${input.token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    cache: "no-store"
  });
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`GitHub content lookup failed (${response.status}).`);
  const data = (await response.json()) as { sha?: string };
  return data.sha;
}

export async function publishFilesToGitHub(input: GitHubPublishInput): Promise<{ published: number; repositoryUrl: string }> {
  let published = 0;
  for (const file of input.files) {
    const sha = await existingSha(input, file.path);
    const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repository)}/contents/${file.path.split("/").map(encodeURIComponent).join("/")}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${input.token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json", "X-GitHub-Api-Version": "2022-11-28" },
      body: JSON.stringify({ message: input.commitMessage, content: Buffer.from(file.content).toString("base64"), branch: input.branch, ...(sha ? { sha } : {}) })
    });
    if (!response.ok) throw new Error(`GitHub publish failed for ${file.path} (${response.status}).`);
    published += 1;
  }
  return { published, repositoryUrl: `https://github.com/${input.owner}/${input.repository}` };
}
