use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};
use xcap::Monitor;
use std::io::Cursor;
use image::imageops::FilterType;
use base64::{engine::general_purpose, Engine as _};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn capture_screen() -> Result<String, String> {
    let monitors = Monitor::all().map_err(|e| e.to_string())?;
    // Get the primary monitor, or fallback to the first available
    let monitor = monitors.into_iter()
        .find(|m| m.is_primary().unwrap_or(false))
        .unwrap_or_else(|| Monitor::all().unwrap().into_iter().next().unwrap());
    
    let mut img = monitor.capture_image().map_err(|e| e.to_string())?;
    
    // Scale down the image to 1024 width max to save bandwidth and local processing time
    if img.width() > 1024 {
        let new_height = (img.height() as f32 * (1024.0 / img.width() as f32)) as u32;
        img = image::imageops::resize(&img, 1024, new_height, FilterType::Triangle);
    }

    let mut buf = Cursor::new(Vec::new());
    let rgb_img = image::DynamicImage::ImageRgba8(img).into_rgb8();
    image::DynamicImage::ImageRgb8(rgb_img).write_to(&mut buf, image::ImageFormat::Jpeg).map_err(|e| e.to_string())?;
    
    let b64 = general_purpose::STANDARD.encode(buf.into_inner());
    Ok(b64)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit_i])?;
            
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let is_visible = window.is_visible().unwrap_or(false);
                            if is_visible {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                })
                .build(app)?;
            
            // Make the overlay window click-through
            if let Some(overlay) = app.get_webview_window("overlay") {
                let _ = overlay.set_ignore_cursor_events(true);
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, capture_screen])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
