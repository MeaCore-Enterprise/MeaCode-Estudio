use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LicenseInfo {
    pub is_premium: bool,
    pub features: Vec<String>,
    pub expires_at: Option<u64>, // Unix timestamp
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Feature {
    AICompletion,
    AIChat,
    AdvancedRefactoring,
    GPUAcceleration,
    CustomThemes,
    PluginSystem,
    CloudSync,
}

pub struct LicenseManager {
    license: LicenseInfo,
}

impl LicenseManager {
    pub fn new() -> Self {
        // Default to free tier
        Self {
            license: LicenseInfo {
                is_premium: false,
                features: vec![
                    "basic_editor".to_string(),
                    "file_explorer".to_string(),
                    "terminal".to_string(),
                    "basic_lsp".to_string(),
                ],
                expires_at: None,
            },
        }
    }

    pub fn with_license(license: LicenseInfo) -> Self {
        Self { license }
    }

    pub fn has_feature(&self, feature: Feature) -> bool {
        let feature_name = match feature {
            Feature::AICompletion => "ai_completion",
            Feature::AIChat => "ai_chat",
            Feature::AdvancedRefactoring => "advanced_refactoring",
            Feature::GPUAcceleration => "gpu_acceleration",
            Feature::CustomThemes => "custom_themes",
            Feature::PluginSystem => "plugin_system",
            Feature::CloudSync => "cloud_sync",
        };

        self.license.features.contains(&feature_name.to_string())
            || self.license.is_premium
    }

    pub fn is_premium(&self) -> bool {
        self.license.is_premium
    }

    pub fn get_license_info(&self) -> &LicenseInfo {
        &self.license
    }

    pub fn activate_license(&mut self, license_key: &str) -> Result<(), String> {
        // TODO: Implement actual license validation
        // For now, just a placeholder
        if license_key.starts_with("PREMIUM-") {
            self.license.is_premium = true;
            self.license.features = vec![
                "basic_editor".to_string(),
                "file_explorer".to_string(),
                "terminal".to_string(),
                "basic_lsp".to_string(),
                "ai_completion".to_string(),
                "ai_chat".to_string(),
                "advanced_refactoring".to_string(),
                "gpu_acceleration".to_string(),
                "custom_themes".to_string(),
                "plugin_system".to_string(),
                "cloud_sync".to_string(),
            ];
            Ok(())
        } else {
            Err("Invalid license key".to_string())
        }
    }
}

impl Default for LicenseManager {
    fn default() -> Self {
        Self::new()
    }
}

