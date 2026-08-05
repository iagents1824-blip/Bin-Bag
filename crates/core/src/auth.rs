use crate::models::UserRole;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, thiserror::Error)]
pub enum AuthError {
    #[error("Failed to hash password: {0}")]
    HashError(String),
    #[error("Failed to verify password: {0}")]
    VerifyError(String),
    #[error("Failed to create token: {0}")]
    TokenCreation(String),
    #[error("Failed to validate token: {0}")]
    TokenValidation(String),
    #[error("Invalid credentials")]
    InvalidCredentials,
}

pub fn hash_password(password: &str) -> Result<String, AuthError> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    
    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| AuthError::HashError(e.to_string()))?
        .to_string();
        
    Ok(password_hash)
}

pub fn verify_password(password: &str, hash: &str) -> Result<bool, AuthError> {
    let parsed_hash = PasswordHash::new(hash)
        .map_err(|e| AuthError::VerifyError(e.to_string()))?;
        
    let result = Argon2::default().verify_password(password.as_bytes(), &parsed_hash);
    
    match result {
        Ok(_) => Ok(true),
        Err(argon2::password_hash::Error::Password) => Ok(false),
        Err(e) => Err(AuthError::VerifyError(e.to_string())),
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub role: String,
    pub exp: usize,
    pub iat: usize,
}

pub fn encode_jwt(user_id: &Uuid, role: &UserRole, secret: &str) -> Result<String, AuthError> {
    let iat = Utc::now().timestamp() as usize;
    let exp = (Utc::now() + Duration::hours(24)).timestamp() as usize;
    
    let role_str = match role {
        UserRole::Buyer => "buyer",
        UserRole::Seller => "seller",
        UserRole::Expert => "expert",
        UserRole::Admin => "admin",
    }.to_string();

    let claims = Claims {
        sub: user_id.to_string(),
        role: role_str,
        exp,
        iat,
    };
    
    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| AuthError::TokenCreation(e.to_string()))
}

pub fn decode_jwt(token: &str, secret: &str) -> Result<Claims, AuthError> {
    let mut validation = Validation::default();
    validation.validate_exp = true;
    
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &validation,
    )
    .map_err(|e| AuthError::TokenValidation(e.to_string()))?;
    
    Ok(token_data.claims)
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    #[test]
    fn test_password_hashing_and_verification() {
        let password = "super_secret_password_123!";
        let hash = hash_password(password).expect("Hash password failed");
        
        assert_ne!(password, hash);
        
        let verify_ok = verify_password(password, &hash).expect("Verify failed");
        assert!(verify_ok, "Password should verify correctly");
        
        let verify_bad = verify_password("wrong_password", &hash).expect("Verify failed on wrong password");
        assert!(!verify_bad, "Wrong password should not verify");
    }

    #[test]
    fn test_jwt_encode_decode() {
        let user_id = Uuid::new_v4();
        let role = UserRole::Seller;
        let secret = "my_super_secret_jwt_key_32_bytes_min";
        
        let token = encode_jwt(&user_id, &role, secret).expect("Encode JWT failed");
        let claims = decode_jwt(&token, secret).expect("Decode JWT failed");
        
        assert_eq!(claims.sub, user_id.to_string());
        assert_eq!(claims.role, "seller");
    }
}
