package com.merchantgrowth.security;

import org.springframework.stereotype.Component;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.util.HexFormat;

@Component
public class PasswordHasher {

    private static final int ITERATIONS = 65536;
    private static final int KEY_LENGTH = 256;
    private static final int SALT_BYTES = 16;
    private static final String ALGORITHM = "PBKDF2WithHmacSHA256";
    private final SecureRandom secureRandom = new SecureRandom();

    public record HashedPassword(String saltHex, String hashHex) {}

    public HashedPassword hashPassword(String password) {
        byte[] salt = new byte[SALT_BYTES];
        secureRandom.nextBytes(salt);
        byte[] hash = pbkdf2(password.toCharArray(), salt, ITERATIONS, KEY_LENGTH);
        return new HashedPassword(
                HexFormat.of().formatHex(salt),
                HexFormat.of().formatHex(hash)
        );
    }

    public boolean verifyPassword(String password, String saltHex, String storedHashHex) {
        if (password == null || saltHex == null || storedHashHex == null) {
            return false;
        }
        try {
            byte[] salt = HexFormat.of().parseHex(saltHex);
            byte[] expectedHash = HexFormat.of().parseHex(storedHashHex);
            byte[] actualHash = pbkdf2(password.toCharArray(), salt, ITERATIONS, KEY_LENGTH);
            return MessageDigest.isEqual(expectedHash, actualHash);
        } catch (Exception e) {
            return false;
        }
    }

    private byte[] pbkdf2(char[] password, byte[] salt, int iterations, int keyLength) {
        try {
            PBEKeySpec spec = new PBEKeySpec(password, salt, iterations, keyLength);
            SecretKeyFactory factory = SecretKeyFactory.getInstance(ALGORITHM);
            return factory.generateSecret(spec).getEncoded();
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new IllegalStateException("Failed to hash password with algorithm " + ALGORITHM, e);
        }
    }
}
