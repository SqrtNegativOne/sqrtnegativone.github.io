use std::fs;
use std::path::Path;
use std::time::Duration;
use tauri::Manager;

/// Run a blocking task (process spawns, network calls) off the UI thread.
///
/// Tauri executes synchronous commands on the main thread, so a slow
/// `git`/`bun` spawn would freeze the window. Async commands are dispatched to
/// the runtime instead; `spawn_blocking` keeps the blocking work off the async
/// workers too.
async fn run_blocking<T, F>(task: F) -> Result<T, String>
where
    F: FnOnce() -> Result<T, String> + Send + 'static,
    T: Send + 'static,
{
    tauri::async_runtime::spawn_blocking(task)
        .await
        .map_err(|e| format!("Background task failed: {e}"))?
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&path).parent() {
        let _ = fs::create_dir_all(parent);
    }
    fs::write(path, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn read_dir(path: String) -> Result<Vec<String>, String> {
    let mut files = Vec::new();
    let entries = fs::read_dir(path).map_err(|e| e.to_string())?;
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        files.push(entry.file_name().into_string().unwrap_or_default());
    }
    Ok(files)
}

#[tauri::command]
fn mkdir(path: String) -> Result<(), String> {
    fs::create_dir_all(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn unlink(path: String) -> Result<(), String> {
    fs::remove_file(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn access(path: String) -> bool {
    Path::new(&path).exists()
}

#[tauri::command]
fn write_file_binary(path: String, content: Vec<u8>) -> Result<(), String> {
    if let Some(parent) = Path::new(&path).parent() {
        let _ = fs::create_dir_all(parent);
    }
    fs::write(path, content).map_err(|e| e.to_string())
}

/// Walk up from `start` looking for the Git repository root.
///
/// The marker is `.git`, *not* `svelte.config.js`: this is a monorepo whose
/// SvelteKit apps (`site/`, `cv/`, `admin/`) each own a `svelte.config.js`
/// one level below the repository root. Checking for that file walks straight
/// past the real root (which has no config of its own) and fails.
fn find_repo_root_from(mut start: std::path::PathBuf) -> Option<String> {
    loop {
        if start.join(".git").exists() {
            return Some(start.to_string_lossy().to_string());
        }
        if !start.pop() {
            return None;
        }
    }
}

#[tauri::command]
fn get_repo_root() -> Result<String, String> {
    // Try current_dir first
    if let Ok(current) = std::env::current_dir() {
        if let Some(root) = find_repo_root_from(current) {
            return Ok(root);
        }
    }

    // Fallback to current_exe
    if let Ok(mut current) = std::env::current_exe() {
        current.pop(); // remove executable name
        if let Some(root) = find_repo_root_from(current) {
            return Ok(root);
        }
    }

    // Absolute fallback for the developer's specific machine in case it's installed globally via MSI
    let hardcoded =
        std::path::Path::new("C:\\Users\\arkma\\Documents\\GitHub\\sqrtnegativone.github.io");
    if hardcoded.join(".git").exists() {
        return Ok(hardcoded.to_string_lossy().to_string());
    }

    Err("Could not find repo root".to_string())
}

#[tauri::command]
fn convert_image_to_avif(path: String) -> Result<String, String> {
    let output_path = if path.ends_with(".jpg") {
        path.replace(".jpg", ".avif")
    } else if path.ends_with(".png") {
        path.replace(".png", ".avif")
    } else if path.ends_with(".webp") {
        path.replace(".webp", ".avif")
    } else {
        path.clone()
    };

    if path == output_path {
        return Ok(path);
    }

    let mut cmd = std::process::Command::new("ffmpeg");
    cmd.args([
        "-y", 
        "-i", &path, 
        "-c:v", "libaom-av1", 
        "-still-picture", "1", 
        "-cpu-used", "8", 
        "-row-mt", "1",
        "-tiles", "2x2",
        "-threads", "0",
        &output_path
    ]);
    
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    }
    
    let status = cmd
        .status()
        .map_err(|e| e.to_string())?;

    if !status.success() {
        return Err("ffmpeg conversion failed".to_string());
    }

    let _ = std::fs::remove_file(&path);

    Ok(output_path)
}

#[tauri::command]
fn fetch_url(url: String) -> Result<String, String> {
    let client = reqwest::blocking::Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36")
        .build()
        .map_err(|e| e.to_string())?;

    let res = client.get(&url).send().map_err(|e| e.to_string())?;
    let text = res.text().map_err(|e| e.to_string())?;
    Ok(text)
}

#[tauri::command]
fn fetch_binary(url: String) -> Result<Vec<u8>, String> {
    let client = reqwest::blocking::Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36")
        .build()
        .map_err(|e| e.to_string())?;

    let res = client.get(&url).send().map_err(|e| e.to_string())?;
    let bytes = res.bytes().map_err(|e| e.to_string())?;
    Ok(bytes.to_vec())
}

#[tauri::command]
fn download_and_save_image(url: String, path: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&path).parent() {
        let _ = fs::create_dir_all(parent);
    }
    let client = reqwest::blocking::Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36")
        .build()
        .map_err(|e| e.to_string())?;

    let res = client.get(&url).send().map_err(|e| e.to_string())?;
    let bytes = res.bytes().map_err(|e| e.to_string())?;
    fs::write(&path, &bytes).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn save_base64_image(path: String, base64_content: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&path).parent() {
        let _ = fs::create_dir_all(parent);
    }
    use base64::{engine::general_purpose::STANDARD, Engine as _};
    let bytes = STANDARD
        .decode(&base64_content)
        .map_err(|e| e.to_string())?;
    fs::write(&path, &bytes).map_err(|e| e.to_string())?;
    Ok(())
}

/// Database id from `site/wrangler.jsonc`. Public metadata, not a secret.
const D1_DATABASE_ID: &str = "849df495-bf8d-4884-90cb-8d1eed2686b7";

/// Credentials for the Cloudflare D1 HTTP API.
///
/// Read from `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` when present,
/// otherwise from the gitignored `admin/data/cloudflare.json`:
/// `{ "api_token": "...", "account_id": "..." }`.
///
/// API tokens can be created without an expiry and with a narrow
/// `Account > D1 > Edit` permission, so this never needs the monthly
/// `wrangler login` refresh that OAuth requires.
struct CloudflareConfig {
    api_token: String,
    account_id: String,
}

impl CloudflareConfig {
    fn load() -> Result<Self, String> {
        let mut api_token = std::env::var("CLOUDFLARE_API_TOKEN").ok();
        let mut account_id = std::env::var("CLOUDFLARE_ACCOUNT_ID").ok();

        if api_token.is_none() || account_id.is_none() {
            let config_path = Path::new(&get_repo_root()?)
                .join("admin")
                .join("data")
                .join("cloudflare.json");
            match fs::read_to_string(&config_path) {
                Ok(contents) => {
                    let file: serde_json::Value = serde_json::from_str(&contents).map_err(|e| {
                        format!("Could not parse {}: {e}", config_path.display())
                    })?;
                    if api_token.is_none() {
                        api_token = file
                            .get("api_token")
                            .and_then(|value| value.as_str())
                            .map(str::to_string);
                    }
                    if account_id.is_none() {
                        account_id = file
                            .get("account_id")
                            .and_then(|value| value.as_str())
                            .map(str::to_string);
                    }
                }
                Err(err) if err.kind() == std::io::ErrorKind::NotFound => {}
                Err(err) => {
                    return Err(format!("Could not read {}: {err}", config_path.display()));
                }
            }
        }

        match (api_token, account_id) {
            (Some(api_token), Some(account_id)) => Ok(Self {
                api_token,
                account_id,
            }),
            _ => Err(
                "Cloudflare API token is not configured. Create a token with the \
                 `Account > D1 > Edit` permission (set expiry to never), then save \
                 {\"api_token\":\"...\",\"account_id\":\"...\"} to \
                 admin/data/cloudflare.json (gitignored)."
                    .to_string(),
            ),
        }
    }
}

/// Run a read or write SQL statement against the remote D1 `sqrt-fyi-messages`
/// database through Cloudflare's HTTP API. Returns the `results` array of the
/// first statement.
#[tauri::command]
async fn d1_query(sql: String) -> Result<serde_json::Value, String> {
    run_blocking(move || d1_query_blocking(sql)).await
}

fn d1_query_blocking(sql: String) -> Result<serde_json::Value, String> {
    let config = CloudflareConfig::load()?;
    let url = format!(
        "https://api.cloudflare.com/client/v4/accounts/{}/d1/database/{}/query",
        config.account_id, D1_DATABASE_ID
    );

    let client = reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(30))
        .build()
        .map_err(|e| e.to_string())?;

    let response = client
        .post(&url)
        .bearer_auth(&config.api_token)
        .json(&serde_json::json!({ "sql": sql }))
        .send()
        .map_err(|e| format!("Cloudflare D1 request failed: {e}"))?;

    let status = response.status();
    let body: serde_json::Value = response
        .json()
        .map_err(|e| format!("Cloudflare D1 returned an unreadable response ({status}): {e}"))?;

    if !status.is_success() || body.get("success").and_then(|v| v.as_bool()) != Some(true) {
        let errors = body
            .get("errors")
            .cloned()
            .unwrap_or(serde_json::Value::Null);
        return Err(format!("Cloudflare D1 query failed ({status}): {errors}"));
    }

    let result = body
        .get("result")
        .and_then(|value| value.as_array())
        .and_then(|entries| entries.first())
        .ok_or_else(|| "Cloudflare D1 returned no query result.".to_string())?;

    if result.get("success").and_then(|v| v.as_bool()) == Some(false) {
        let error = result
            .get("error")
            .cloned()
            .unwrap_or(serde_json::Value::Null);
        return Err(format!("Cloudflare D1 query failed: {error}"));
    }

    Ok(result
        .get("results")
        .cloned()
        .unwrap_or_else(|| serde_json::Value::Array(Vec::new())))
}

#[derive(serde::Serialize, Clone, Debug)]
pub struct GitFileChange {
    pub path: String,
    pub status: String,
}

#[derive(serde::Serialize, Clone, Debug)]
pub struct GitStatusInfo {
    pub branch: String,
    pub content_changes: Vec<GitFileChange>,
    pub other_changes_count: usize,
    pub ahead_count: usize,
}

fn is_content_path(path: &str) -> bool {
    let p = path.trim().trim_matches('"');
    let p_norm = p.replace('\\', "/");
    p_norm.starts_with("cv/src/data/")
        || p_norm.starts_with("site/src/data/")
        || p_norm.starts_with("shared/data/")
        || p_norm.starts_with("site/static/media/")
        || p_norm.starts_with("cv/static/projects/")
        || p_norm.starts_with("cv/static/quotes/")
        || p_norm.starts_with("site/static/blog-images/")
        || p_norm.starts_with("site/blog/")
        || (p_norm.ends_with(".json")
            && (p_norm.starts_with("cv/static/")
                || p_norm.starts_with("site/static/")
                || p_norm.starts_with("cv/src/data/")
                || p_norm.starts_with("site/src/data/")))
}

/// Root directories that contain site content. Everything underneath these is
/// safe to stage automatically, including newly created or untracked files.
const CONTENT_ROOTS: &[&str] = &[
    "cv/src/data",
    "site/src/data",
    "shared/data",
    "site/blog",
    "site/static/media",
    "cv/static/projects",
    "cv/static/quotes",
    "site/static/blog-images",
];

fn run_git_cmd(repo_root: &str, args: &[&str]) -> Result<(bool, String, String), String> {
    let mut cmd = std::process::Command::new("git");
    cmd.current_dir(repo_root);
    cmd.args(args);
    cmd.env("GIT_TERMINAL_PROMPT", "0");
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x0800_0000); // CREATE_NO_WINDOW
    }
    let output = cmd.output().map_err(|e| format!("Failed to execute git: {e}"))?;
    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
    Ok((output.status.success(), stdout, stderr))
}

fn generate_default_commit_message(files: &[String]) -> String {
    use std::collections::BTreeSet;
    let mut types = BTreeSet::new();
    for f in files {
        if f.starts_with("cv/src/data/projects") || f.starts_with("cv/static/projects") {
            types.insert("projects");
        } else if f.starts_with("cv/static/quotes") {
            types.insert("quotes");
        } else if f.starts_with("site/static/media") {
            types.insert("media");
        } else if f.starts_with("site/blog/") || f.starts_with("site/static/blog-images") {
            types.insert("blog");
        } else if f.starts_with("cv/src/data/skills") {
            types.insert("skills");
        } else if f.starts_with("shared/data/socials") {
            types.insert("socials");
        } else if f.starts_with("shared/data/now") {
            types.insert("arcs");
        } else if f.starts_with("site/src/data/questions") {
            types.insert("questions");
        } else if let Some(rest) = f.strip_prefix("site/src/data/") {
            let name = rest.trim_end_matches(".json").trim_end_matches(".md");
            types.insert(name);
        } else if let Some(rest) = f.strip_prefix("cv/src/data/") {
            let name = rest.trim_end_matches(".json").trim_end_matches(".md");
            types.insert(name);
        } else if let Some(rest) = f.strip_prefix("shared/data/") {
            let name = rest.trim_end_matches(".json").trim_end_matches(".md");
            types.insert(name);
        } else {
            types.insert("content");
        }
    }

    let type_list: Vec<&str> = types.into_iter().collect();
    if type_list.is_empty() {
        "content: update site content".to_string()
    } else if type_list.len() == 1 {
        format!("content({}): update {}", type_list[0], type_list[0])
    } else {
        format!("content: update {}", type_list.join(", "))
    }
}

#[tauri::command]
async fn git_get_status() -> Result<GitStatusInfo, String> {
    run_blocking(git_get_status_blocking).await
}

fn git_get_status_blocking() -> Result<GitStatusInfo, String> {
    let root = get_repo_root()?;

    // 1. Check current branch
    let (branch_ok, branch_out, _) = run_git_cmd(&root, &["branch", "--show-current"])?;
    let branch = if branch_ok && !branch_out.is_empty() {
        branch_out
    } else {
        "main".to_string()
    };

    // 2. Check porcelain status
    let (status_ok, status_out, status_err) = run_git_cmd(
        &root,
        &["-c", "core.quotepath=false", "status", "--porcelain=v1", "-uall"],
    )?;
    if !status_ok {
        return Err(format!("git status failed: {status_err}"));
    }

    let mut content_changes = Vec::new();
    let mut other_changes_count = 0;

    for line in status_out.lines() {
        let line = line.trim_end();
        if line.len() < 4 {
            continue;
        }
        let status_code = line[..2].trim().to_string();
        let raw_path = line[3..].trim();
        let path = if let Some((_orig, dest)) = raw_path.split_once(" -> ") {
            dest.trim().trim_matches('"').replace('\\', "/")
        } else {
            raw_path.trim_matches('"').replace('\\', "/")
        };

        if is_content_path(&path) {
            content_changes.push(GitFileChange {
                path,
                status: status_code,
            });
        } else {
            other_changes_count += 1;
        }
    }

    // 3. Ahead count (unpushed commits)
    let ahead_count = if let Ok((true, count_str, _)) = run_git_cmd(&root, &["rev-list", "--count", "@{u}..HEAD"]) {
        count_str.parse::<usize>().unwrap_or(0)
    } else {
        let remote_ref = format!("origin/{branch}..HEAD");
        if let Ok((true, count_str, _)) = run_git_cmd(&root, &["rev-list", "--count", &remote_ref]) {
            count_str.parse::<usize>().unwrap_or(0)
        } else {
            0
        }
    };

    Ok(GitStatusInfo {
        branch,
        content_changes,
        other_changes_count,
        ahead_count,
    })
}

#[tauri::command]
async fn git_commit_content(message: Option<String>) -> Result<String, String> {
    run_blocking(move || git_commit_content_blocking(message)).await
}

fn git_commit_content_blocking(message: Option<String>) -> Result<String, String> {
    let root = get_repo_root()?;
    let root_path = Path::new(&root);

    // Stage every content root up front. Using `add -A` on the whole root
    // (rather than replaying paths parsed from `git status`) guarantees that
    // brand-new, untracked files such as freshly downloaded posters are picked
    // up instead of silently left behind.
    let existing_roots: Vec<&str> = CONTENT_ROOTS
        .iter()
        .copied()
        .filter(|rel| root_path.join(rel).exists())
        .collect();
    if existing_roots.is_empty() {
        return Err("No content roots found".to_string());
    }

    let mut add_args = vec!["add", "-A", "--"];
    add_args.extend(existing_roots.iter().copied());
    let (add_ok, _, add_err) = run_git_cmd(&root, &add_args)?;
    if !add_ok {
        return Err(format!("git add failed: {add_err}"));
    }

    let (status_ok, status_out, status_err) = run_git_cmd(
        &root,
        &["-c", "core.quotepath=false", "status", "--porcelain=v1", "-uall"],
    )?;
    if !status_ok {
        return Err(format!("git status failed: {status_err}"));
    }

    let mut content_files = Vec::new();
    for line in status_out.lines() {
        let line = line.trim_end();
        if line.len() < 4 {
            continue;
        }
        let raw_path = line[3..].trim();
        let path = if let Some((_orig, dest)) = raw_path.split_once(" -> ") {
            dest.trim().trim_matches('"').replace('\\', "/")
        } else {
            raw_path.trim_matches('"').replace('\\', "/")
        };

        if is_content_path(&path) {
            content_files.push(path);
        }
    }

    if content_files.is_empty() {
        return Err("No content changes to commit".to_string());
    }

    let commit_msg = match message {
        Some(m) if !m.trim().is_empty() => m.trim().to_string(),
        _ => generate_default_commit_message(&content_files),
    };

    let (commit_ok, _, commit_err) = run_git_cmd(&root, &["commit", "-m", &commit_msg])?;
    if !commit_ok {
        return Err(format!("git commit failed: {commit_err}"));
    }

    Ok(commit_msg)
}

/// Fetch, then replay local commits on top of `origin/<branch>` when the remote has
/// moved on (web edits, another machine, merged PRs) — the case where a bare `git push`
/// is rejected as a non-fast-forward.
///
/// Returns `Ok(Some(reason))` when a rebase was performed, `Ok(None)` when the branch
/// was already up to date.
///
/// `--autostash` is required: the admin app deliberately leaves non-content files
/// uncommitted (see `is_content_path`), and a rebase refuses to run on a dirty tree.
/// Any failure is rolled back with `rebase --abort` so the developer is never stranded
/// mid-rebase in a GUI with no conflict resolution UI.
fn sync_with_remote(repo_root: &str, branch: &str) -> Result<Option<String>, String> {
    let remote_ref = format!("origin/{branch}");

    // Offline or credentials unavailable: skip the sync and let the push attempt
    // surface the real error rather than masking it with a fetch failure.
    let (fetch_ok, _, _) = run_git_cmd(repo_root, &["fetch", "origin"])?;
    if !fetch_ok {
        return Ok(None);
    }

    // Left count = commits we have that the remote doesn't, right = the reverse.
    let (counts_ok, counts_out, _) = run_git_cmd(
        repo_root,
        &[
            "rev-list",
            "--left-right",
            "--count",
            &format!("HEAD...{remote_ref}"),
        ],
    )?;
    if !counts_ok {
        // Remote ref doesn't exist yet (first push) or history is unrelated; let
        // the push attempt decide.
        return Ok(None);
    }

    let mut counts = counts_out.split_whitespace();
    let ahead: u32 = counts.next().and_then(|v| v.parse().ok()).unwrap_or(0);
    let behind: u32 = counts.next().and_then(|v| v.parse().ok()).unwrap_or(0);

    if behind == 0 {
        return Ok(None);
    }

    let reason = if ahead == 0 {
        format!("fast-forwarded {behind} commit(s) from {remote_ref}")
    } else {
        format!("replayed {ahead} local commit(s) onto {remote_ref} ({behind} incoming)")
    };

    let (rebase_ok, _, rebase_err) =
        run_git_cmd(repo_root, &["rebase", "--autostash", &remote_ref])?;

    if !rebase_ok {
        let (abort_ok, _, abort_err) = run_git_cmd(repo_root, &["rebase", "--abort"])?;

        if !abort_ok {
            return Err(format!(
                "could not sync with {remote_ref}: {rebase_err}\n\
                 The repository is left mid-rebase and needs a manual `git rebase --abort`: {abort_err}"
            ));
        }

        return Err(format!(
            "could not sync with {remote_ref}: {rebase_err}\n\
             Local branch was restored to its pre-sync state, so nothing was lost."
        ));
    }

    Ok(Some(reason))
}

#[tauri::command]
async fn git_push() -> Result<String, String> {
    run_blocking(git_push_blocking).await
}

fn git_push_blocking() -> Result<String, String> {
    let root = get_repo_root()?;

    let (branch_ok, branch_out, _) = run_git_cmd(&root, &["branch", "--show-current"])?;
    let branch = if branch_ok && !branch_out.is_empty() {
        branch_out
    } else {
        "main".to_string()
    };

    let synced = sync_with_remote(&root, &branch)?;

    let (push_ok, stdout, stderr) = run_git_cmd(&root, &["push", "origin", &branch])?;
    if !push_ok {
        return Err(format!("git push failed: {stderr}"));
    }

    let push_output = if stdout.is_empty() { stderr } else { stdout };

    Ok(match synced {
        Some(reason) if push_output.is_empty() => {
            format!("Pushed successfully ({reason})")
        }
        Some(reason) => format!("{push_output}\nSynced: {reason}"),
        None if push_output.is_empty() => "Pushed successfully".to_string(),
        None => push_output,
    })
}

#[tauri::command]
async fn git_publish(message: Option<String>) -> Result<String, String> {
    run_blocking(move || git_publish_blocking(message)).await
}

fn git_publish_blocking(message: Option<String>) -> Result<String, String> {
    // 1. Commit content changes if any
    let commit_res = git_commit_content_blocking(message);
    if let Err(e) = commit_res {
        if e != "No content changes to commit" {
            return Err(e);
        }
    }

    // 2. Push to remote
    git_push_blocking()
}

/// # Panics
/// Panics if the tauri application fails to build or run.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            read_dir,
            mkdir,
            unlink,
            access,
            write_file_binary,
            get_repo_root,
            convert_image_to_avif,
            fetch_url,
            fetch_binary,
            download_and_save_image,
            save_base64_image,
            d1_query,
            git_get_status,
            git_commit_content,
            git_push,
            git_publish
        ])
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                // Make sure the window is actually presented, even if a previous
                // run left it hidden/minimized or the OS restored a stale state.
                let _ = window.show();
                let _ = window.unminimize();
                let _ = window.set_focus();
                if let Err(err) = window.is_visible() {
                    eprintln!(
                        "[admin] WebView2 is not responding ({err:?}). Check \
                         Microsoft-Windows-CodeIntegrity/Operational for injected DLLs \
                         blocked from msedgewebview2.exe (e.g. Windhawk)."
                    );
                }

                // `maximized: true` in tauri.conf.json makes WebView2 155 create
                // the window with WS_MINIMIZE on Windows 11 25H2, so it never
                // appears. Start normal and maximize once the event loop runs.
                let handle = window.clone();
                std::thread::spawn(move || {
                    std::thread::sleep(std::time::Duration::from_millis(400));
                    let _ = handle.show();
                    let _ = handle.unminimize();
                    let _ = handle.maximize();
                    let _ = handle.set_focus();
                });
            } else {
                eprintln!("[admin] main webview window was not created");
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_content_path_detection() {
        assert!(is_content_path("cv/src/data/projects.json"));
        assert!(is_content_path("cv/src/data/skills.json"));
        assert!(is_content_path("shared/data/socials.json"));
        assert!(is_content_path("shared/data/now.json"));
        assert!(is_content_path("site/static/media/poster.avif"));
        assert!(is_content_path("site/static/media/media.json"));
        assert!(is_content_path("cv/static/quotes/quotes.json"));
        assert!(is_content_path("cv/static/projects/hero.png"));
        assert!(is_content_path("site/static/blog-images/img.png"));
        assert!(is_content_path("site/blog/posts/hello.md"));

        // Code / non-content files must be excluded
        assert!(!is_content_path("site/src/routes/+page.svelte"));
        assert!(!is_content_path("cv/src/routes/+page.svelte"));
        assert!(!is_content_path("admin/src/lib/db.ts"));
        assert!(!is_content_path("package.json"));
        assert!(!is_content_path("site/src/lib/utils.ts"));
    }

    #[test]
    fn test_default_commit_message_generation() {
        assert_eq!(
            generate_default_commit_message(&["site/src/data/questions.md".to_string()]),
            "content(questions): update questions"
        );
        assert_eq!(
            generate_default_commit_message(&["cv/static/quotes/quotes.json".to_string()]),
            "content(quotes): update quotes"
        );
        assert_eq!(
            generate_default_commit_message(&["site/static/media/test.avif".to_string()]),
            "content(media): update media"
        );
        assert_eq!(
            generate_default_commit_message(&["shared/data/now.json".to_string()]),
            "content(arcs): update arcs"
        );
        assert_eq!(
            generate_default_commit_message(&["shared/data/socials.json".to_string()]),
            "content(socials): update socials"
        );
        assert_eq!(
            generate_default_commit_message(&[
                "cv/static/quotes/quotes.json".to_string(),
                "cv/src/data/projects.json".to_string()
            ]),
            "content: update projects, quotes"
        );
    }
}

