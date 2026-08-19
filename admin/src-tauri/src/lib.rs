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
    let mut current = std::env::current_dir().map_err(|e| e.to_string())?;
    loop {
        if current.join("eleventy.config.js").exists() {
            return Ok(current.to_string_lossy().to_string());
        }
        if !current.pop() {
            break;
        }
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
    
    let status = std::process::Command::new("ffmpeg")
        .args(["-y", "-i", &path, &output_path])
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
        fetch_url
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
