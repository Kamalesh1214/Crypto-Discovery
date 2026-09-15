package com.example.crypto;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.MessageDigest;

/**
 * CryptoLens Test Fixture: Token Service
 * DEMO DATA ONLY - Illustrates RSA-1024 and HMAC.
 */
public class TokenService {

    // Weakness: 1024-bit RSA KeyPairGenerator (deprecated classical size & quantum candidate)
    public static KeyPair generateLegacyKeyPair() throws Exception {
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
        kpg.initialize(1024);
        return kpg.generateKeyPair();
    }

    // Modern HMAC with SHA-256
    public static byte[] signToken(byte[] secret, byte[] token) throws Exception {
        SecretKeySpec key = new SecretKeySpec(secret, "HmacSHA256");
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(key);
        return mac.doFinal(token);
    }

    // Modern SHA-256 Digest
    public static byte[] hashToken(byte[] token) throws Exception {
        MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
        return sha256.digest(token);
    }
}
