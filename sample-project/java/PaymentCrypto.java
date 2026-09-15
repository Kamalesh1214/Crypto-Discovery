package com.example.crypto;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.security.MessageDigest;

/**
 * CryptoLens Test Fixture: Payment Cryptography
 * DEMO DATA ONLY - Contains intentional cryptographic weaknesses.
 */
public class PaymentCrypto {

    // Weakness: Triple-DES (3DES / DESede) with 64-bit block size (Sweet32 attack)
    public static byte[] encryptPaymentRecord(byte[] data, byte[] keyBytes) throws Exception {
        SecretKeySpec key = new SecretKeySpec(keyBytes, "DESede");
        Cipher cipher = Cipher.getInstance("DESede/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        return cipher.doFinal(data);
    }

    // Weakness: RC4 stream cipher
    public static byte[] streamEncrypt(byte[] data, byte[] keyBytes) throws Exception {
        SecretKeySpec key = new SecretKeySpec(keyBytes, "RC4");
        Cipher cipher = Cipher.getInstance("RC4");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        return cipher.doFinal(data);
    }

    // Weakness: MD5 and SHA-1 hashes
    public static byte[] computeLegacyChecksum(byte[] input) throws Exception {
        MessageDigest md5 = MessageDigest.getInstance("MD5");
        return md5.digest(input);
    }

    public static byte[] computeSha1Checksum(byte[] input) throws Exception {
        MessageDigest sha1 = MessageDigest.getInstance("SHA-1");
        return sha1.digest(input);
    }
}
