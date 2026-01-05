use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: MessageRole,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MessageRole {
    System,
    User,
    Assistant,
}

#[derive(Debug, Clone)]
pub enum AIProvider {
    OpenAI,
    Anthropic,
    Local,
}

#[async_trait::async_trait]
pub trait AIProviderTrait: Send + Sync {
    fn name(&self) -> &str;
    async fn chat(&self, messages: Vec<ChatMessage>) -> Result<String>;
    // Note: stream_chat removed for now as Iterator is not compatible with async traits
    // Will be implemented using channels or async streams in the future
}

pub struct AIService {
    providers: HashMap<String, Box<dyn AIProviderTrait>>,
    default_provider: String,
}

impl AIService {
    pub fn new() -> Self {
        let mut providers: HashMap<String, Box<dyn AIProviderTrait>> = HashMap::new();
        
        // Add default providers
        providers.insert("openai".to_string(), Box::new(OpenAIProvider::new()));
        providers.insert("anthropic".to_string(), Box::new(AnthropicProvider::new()));
        providers.insert("local".to_string(), Box::new(LocalProvider::new()));

        Self {
            providers,
            default_provider: "local".to_string(),
        }
    }

    pub async fn chat(&self, messages: Vec<ChatMessage>, provider: Option<&str>) -> Result<String> {
        let provider_name = provider.unwrap_or(&self.default_provider);
        let provider = self.providers.get(provider_name)
            .ok_or_else(|| anyhow::anyhow!("Provider {} not found", provider_name))?;
        
        provider.chat(messages).await
    }

    pub fn set_default_provider(&mut self, provider: String) {
        if self.providers.contains_key(&provider) {
            self.default_provider = provider;
        }
    }
}

// OpenAI Provider
pub struct OpenAIProvider {
    api_key: Option<String>,
    base_url: String,
}

impl OpenAIProvider {
    pub fn new() -> Self {
        Self {
            api_key: std::env::var("OPENAI_API_KEY").ok(),
            base_url: "https://api.openai.com/v1".to_string(),
        }
    }
}

#[async_trait::async_trait]
impl AIProviderTrait for OpenAIProvider {
    fn name(&self) -> &str {
        "openai"
    }

    async fn chat(&self, messages: Vec<ChatMessage>) -> Result<String> {
        if self.api_key.is_none() {
            return Err(anyhow::anyhow!("OpenAI API key not set"));
        }

        // TODO: Implement actual OpenAI API call
        Ok("OpenAI provider not yet implemented".to_string())
    }

}

// Anthropic Provider
pub struct AnthropicProvider {
    api_key: Option<String>,
    base_url: String,
}

impl AnthropicProvider {
    pub fn new() -> Self {
        Self {
            api_key: std::env::var("ANTHROPIC_API_KEY").ok(),
            base_url: "https://api.anthropic.com/v1".to_string(),
        }
    }
}

#[async_trait::async_trait]
impl AIProviderTrait for AnthropicProvider {
    fn name(&self) -> &str {
        "anthropic"
    }

    async fn chat(&self, messages: Vec<ChatMessage>) -> Result<String> {
        if self.api_key.is_none() {
            return Err(anyhow::anyhow!("Anthropic API key not set"));
        }

        // TODO: Implement actual Anthropic API call
        Ok("Anthropic provider not yet implemented".to_string())
    }

}

// Local Provider (Echo for now)
pub struct LocalProvider;

impl LocalProvider {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait::async_trait]
impl AIProviderTrait for LocalProvider {
    fn name(&self) -> &str {
        "local"
    }

    async fn chat(&self, messages: Vec<ChatMessage>) -> Result<String> {
        // Simple echo for now - will be replaced with actual local model
        if let Some(last_message) = messages.last() {
            Ok(format!("Echo: {}", last_message.content))
        } else {
            Ok("No messages provided".to_string())
        }
    }

}

