"""Unit tests for sensitive data masking functions."""

from app.core.masking import mask_email, mask_phone  # noqa: E402


class TestMaskPhone:
    def test_standard_phone(self):
        assert mask_phone("13812341234") == "138****1234"

    def test_short_phone(self):
        assert mask_phone("12345") == "12345"

    def test_empty(self):
        assert mask_phone("") == ""

    def test_none(self):
        assert mask_phone(None) is None

    def test_exactly_seven_chars(self):
        assert mask_phone("1234567") == "123****4567"


class TestMaskEmail:
    def test_standard_email(self):
        assert mask_email("test@example.com") == "t***@example.com"

    def test_single_char_local(self):
        assert mask_email("a@example.com") == "a***@example.com"

    def test_no_at_sign(self):
        assert mask_email("notanemail") == "notanemail"

    def test_empty(self):
        assert mask_email("") == ""

    def test_none(self):
        assert mask_email(None) is None

    def test_long_local(self):
        assert mask_email("longname@domain.org") == "l***@domain.org"
