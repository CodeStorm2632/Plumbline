"""Unit tests for password policy validation."""

from app.core.password_policy import validate_password_strength


class TestPasswordPolicy:
    def test_valid_password(self):
        assert validate_password_strength("MyPass@123") is None

    def test_too_short(self):
        result = validate_password_strength("Ab@1")
        assert result is not None
        assert "长度" in result

    def test_too_long(self):
        result = validate_password_strength("A" * 129 + "@1a")
        assert result is not None
        assert "长度" in result

    def test_missing_uppercase(self):
        result = validate_password_strength("mypass@123")
        assert result is not None
        assert "大写" in result

    def test_missing_lowercase(self):
        result = validate_password_strength("MYPASS@123")
        assert result is not None
        assert "小写" in result

    def test_missing_digit(self):
        result = validate_password_strength("MyPass@abc")
        assert result is not None
        assert "数字" in result

    def test_missing_special(self):
        result = validate_password_strength("MyPass1234")
        assert result is not None
        assert "特殊字符" in result

    def test_exact_min_length(self):
        # Exactly 8 chars with all requirements
        assert validate_password_strength("Ab@1xxxx") is None

    def test_all_requirements_met(self):
        assert validate_password_strength("Complex@Pass123!") is None
