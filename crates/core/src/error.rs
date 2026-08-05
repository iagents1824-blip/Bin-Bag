use crate::auth::AuthError;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Auth error: {0}")]
    Auth(#[from] AuthError),
    #[error("Database error: {0}")]
    Database(String),
    #[error("Not found: {0}")]
    NotFound(String),
    #[error("Forbidden: {0}")]
    Forbidden(String),
    #[error("Validation error: {0}")]
    Validation(String),
    #[error("Internal error: {0}")]
    Internal(String),
}

impl From<sqlx::Error> for AppError {
    fn from(error: sqlx::Error) -> Self {
        AppError::Database(error.to_string())
    }
}
