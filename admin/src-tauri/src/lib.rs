use std::fs;
use std::path::Path;

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

#[tauri::command]
fn get_repo_root() -> Result<String, String> {
    // Try current_dir first
    if let Ok(mut current) = std::env::current_dir() {
        loop {
            if current.join("eleventy.config.js").exists() {
                return Ok(current.to_string_lossy().to_string());
            }
            if !current.pop() {
                break;
            }
        }
    }

    // Fallback to current_exe
    if let Ok(mut current) = std::env::current_exe() {
        current.pop(); // remove executable name
        loop {
            if current.join("eleventy.config.js").exists() {
                return Ok(current.to_string_lossy().to_string());
            }
            if !current.pop() {
                break;
            }
        }
    }

    // Absolute fallback for the developer's specific machine in case it's installed globally via MSI
    let hardcoded =
        std::path::Path::new("C:\\Users\\arkma\\Documents\\GitHub\\sqrtnegativone.github.io");
    if hardcoded.join("eleventy.config.js").exists() {
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
    p_norm.starts_with("src/data/")
        || p_norm.starts_with("static/media/")
        || p_norm.starts_with("static/projects/")
        || p_norm.starts_with("static/quotes/")
        || p_norm.starts_with("static/blog-images/")
        || p_norm.starts_with("blog/")
}

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
        if f.starts_with("src/data/projects") || f.starts_with("static/projects") {
            types.insert("projects");
        } else if f.starts_with("static/quotes") {
            types.insert("quotes");
        } else if f.starts_with("static/media") {
            types.insert("media");
        } else if f.starts_with("blog/") || f.starts_with("static/blog-images") {
            types.insert("blog");
        } else if f.starts_with("src/data/skills") {
            types.insert("skills");
        } else if f.starts_with("src/data/socials") {
            types.insert("socials");
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
fn git_get_status() -> Result<GitStatusInfo, String> {
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
fn git_commit_content(message: Option<String>) -> Result<String, String> {
    let root = get_repo_root()?;

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

    let mut add_args = vec!["add", "--"];
    for f in &content_files {
        add_args.push(f.as_str());
    }
    let (add_ok, _, add_err) = run_git_cmd(&root, &add_args)?;
    if !add_ok {
        return Err(format!("git add failed: {add_err}"));
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

#[tauri::command]
fn git_push() -> Result<String, String> {
    let root = get_repo_root()?;

    let (branch_ok, branch_out, _) = run_git_cmd(&root, &["branch", "--show-current"])?;
    let branch = if branch_ok && !branch_out.is_empty() {
        branch_out
    } else {
        "main".to_string()
    };

    let (push_ok, stdout, stderr) = run_git_cmd(&root, &["push", "origin", &branch])?;
    if !push_ok {
        return Err(format!("git push failed: {stderr}"));
    }

    if stdout.is_empty() {
        if stderr.is_empty() {
            Ok("Pushed successfully".to_string())
        } else {
            Ok(stderr)
        }
    } else {
        Ok(stdout)
    }
}

#[tauri::command]
fn git_publish(message: Option<String>) -> Result<String, String> {
    // 1. Commit content changes if any
    let commit_res = git_commit_content(message);
    if let Err(e) = commit_res {
        if e != "No content changes to commit" {
            return Err(e);
        }
    }

    // 2. Push to remote
    git_push()
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
            git_get_status,
            git_commit_content,
            git_push,
            git_publish
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
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
        assert!(is_content_path("src/data/quotes.json"));
        assert!(is_content_path("src/data/projects.json"));
        assert!(is_content_path("static/media/poster.avif"));
        assert!(is_content_path("static/quotes/quotes.json"));
        assert!(is_content_path("static/blog-images/img.png"));
        assert!(is_content_path("blog/posts/hello.md"));

        // Code / non-content files must be excluded
        assert!(!is_content_path("src/routes/+page.svelte"));
        assert!(!is_content_path("admin/src/lib/db.ts"));
        assert!(!is_content_path("package.json"));
        assert!(!is_content_path("src/lib/utils.ts"));
    }

    #[test]
    fn test_default_commit_message_generation() {
        assert_eq!(
            generate_default_commit_message(&["static/quotes/quotes.json".to_string()]),
            "content(quotes): update quotes"
        );
        assert_eq!(
            generate_default_commit_message(&["static/media/test.avif".to_string()]),
            "content(media): update media"
        );
        assert_eq!(
            generate_default_commit_message(&[
                "static/quotes/quotes.json".to_string(),
                "src/data/projects.json".to_string()
            ]),
            "content: update projects, quotes"
        );
    }
}

