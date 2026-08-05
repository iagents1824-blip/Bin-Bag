use hmac::{Hmac, Mac};
use sha2::Sha256;

type HmacSha256 = Hmac<Sha256>;

#[derive(Debug, thiserror::Error)]
pub enum StripeError {
    #[error("Invalid signature header format")]
    InvalidHeaderFormat,
    #[error("Missing timestamp or v1 signature in header")]
    MissingSignatureParts,
    #[error("HMAC verification failed: {0}")]
    HmacError(String),
    #[error("Signature mismatch")]
    SignatureMismatch,
}

/// Verifies a Stripe Webhook signature header (`Stripe-Signature`).
/// 
/// `header`: e.g. `t=1492774577,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd`
/// `payload`: raw HTTP request body string
/// `secret`: webhook secret (`whsec_...`)
pub fn verify_webhook_signature(
    payload: &str,
    header: &str,
    secret: &str,
) -> Result<bool, StripeError> {
    let mut timestamp: Option<&str> = None;
    let mut v1_sig: Option<&str> = None;

    for item in header.split(',') {
        let mut parts = item.splitn(2, '=');
        let key = parts.next().map(|s| s.trim());
        let val = parts.next().map(|s| s.trim());
        match (key, val) {
            (Some("t"), Some(t)) => timestamp = Some(t),
            (Some("v1"), Some(sig)) => v1_sig = Some(sig),
            _ => {}
        }
    }

    let timestamp = timestamp.ok_or(StripeError::MissingSignatureParts)?;
    let expected_sig_hex = v1_sig.ok_or(StripeError::MissingSignatureParts)?;

    let signed_payload = format!("{}.{}", timestamp, payload);

    let mut mac = HmacSha256::new_from_slice(secret.as_bytes())
        .map_err(|e| StripeError::HmacError(e.to_string()))?;
    mac.update(signed_payload.as_bytes());

    let computed_sig_bytes = mac.finalize().into_bytes();
    let computed_sig_hex = hex::encode(computed_sig_bytes);

    if computed_sig_hex == expected_sig_hex {
        Ok(true)
    } else {
        Ok(false)
    }
}

/// Computes an HMAC-SHA256 signature header for testing.
pub fn generate_test_signature_header(payload: &str, secret: &str, timestamp: i64) -> String {
    let signed_payload = format!("{}.{}", timestamp, payload);
    let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).unwrap();
    mac.update(signed_payload.as_bytes());
    let sig_hex = hex::encode(mac.finalize().into_bytes());
    format!("t={},v1={}", timestamp, sig_hex)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_verify_webhook_signature_success() {
        let payload = r#"{"id":"evt_test_webhook","type":"checkout.session.completed"}"#;
        let secret = "whsec_test_secret_key_12345";
        let timestamp = 1700000000;

        let header = generate_test_signature_header(payload, secret, timestamp);
        let verified = verify_webhook_signature(payload, &header, secret).expect("Verification error");
        assert!(verified, "Signature should verify successfully");
    }

    #[test]
    fn test_verify_webhook_signature_failure() {
        let payload = r#"{"id":"evt_test_webhook","type":"checkout.session.completed"}"#;
        let secret = "whsec_test_secret_key_12345";
        let timestamp = 1700000000;

        let header = generate_test_signature_header(payload, secret, timestamp);
        // Tamper with payload
        let tampered = r#"{"id":"evt_test_webhook","type":"checkout.session.completed","tampered":true}"#;
        let verified = verify_webhook_signature(tampered, &header, secret).expect("Verification error");
        assert!(!verified, "Tampered payload should fail verification");
    }
}
