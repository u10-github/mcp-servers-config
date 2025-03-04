import json
from unittest.mock import AsyncMock, MagicMock, mock_open, patch

import httpx
import pytest
import pytest_asyncio

from supabase_mcp.api_manager.api_spec_manager import ApiSpecManager

# Test data
SAMPLE_SPEC = {"openapi": "3.0.0", "paths": {"/v1/test": {"get": {"operationId": "test"}}}}


@pytest_asyncio.fixture
async def api_spec_manager():
    manager = await ApiSpecManager.create()
    yield manager


# Local Spec Tests
def test_load_local_spec_success(api_spec_manager):
    """Test successful loading of local spec file"""
    mock_file = mock_open(read_data=json.dumps(SAMPLE_SPEC))

    with patch("builtins.open", mock_file):
        result = api_spec_manager._load_local_spec()

    assert result == SAMPLE_SPEC
    mock_file.assert_called_once()


def test_load_local_spec_file_not_found(api_spec_manager):
    """Test handling of missing local spec file"""
    with patch("builtins.open", side_effect=FileNotFoundError), pytest.raises(FileNotFoundError):
        api_spec_manager._load_local_spec()


def test_load_local_spec_invalid_json(api_spec_manager):
    """Test handling of invalid JSON in local spec"""
    mock_file = mock_open(read_data="invalid json")

    with patch("builtins.open", mock_file), pytest.raises(json.JSONDecodeError):
        api_spec_manager._load_local_spec()


# Remote Spec Tests
@pytest.mark.asyncio
async def test_fetch_remote_spec_success(api_spec_manager):
    """Test successful remote spec fetch"""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = SAMPLE_SPEC

    mock_client = AsyncMock()
    mock_client.get.return_value = mock_response
    mock_client.__aenter__.return_value = mock_client  # Mock async context manager

    with patch("httpx.AsyncClient", return_value=mock_client):
        result = await api_spec_manager._fetch_remote_spec()

    assert result == SAMPLE_SPEC
    mock_client.get.assert_called_once()


@pytest.mark.asyncio
async def test_fetch_remote_spec_api_error(api_spec_manager):
    """Test handling of API error during remote fetch"""
    mock_response = MagicMock()
    mock_response.status_code = 500

    mock_client = AsyncMock()
    mock_client.get.return_value = mock_response
    mock_client.__aenter__.return_value = mock_client  # Mock async context manager

    with patch("httpx.AsyncClient", return_value=mock_client):
        result = await api_spec_manager._fetch_remote_spec()

    assert result is None


@pytest.mark.asyncio
async def test_fetch_remote_spec_network_error(api_spec_manager):
    """Test handling of network error during remote fetch"""
    mock_client = AsyncMock()
    mock_client.get.side_effect = httpx.NetworkError("Network error")

    with patch("httpx.AsyncClient", return_value=mock_client):
        result = await api_spec_manager._fetch_remote_spec()

    assert result is None


# Startup Flow Tests
@pytest.mark.asyncio
async def test_startup_remote_success(api_spec_manager):
    """Test successful startup with remote fetch"""
    mock_fetch = AsyncMock(return_value=SAMPLE_SPEC)

    with patch.object(api_spec_manager, "_fetch_remote_spec", mock_fetch):
        await api_spec_manager.on_startup()

    assert api_spec_manager.spec == SAMPLE_SPEC
    mock_fetch.assert_called_once()


@pytest.mark.asyncio
async def test_startup_remote_fail_local_fallback(api_spec_manager):
    """Test fallback to local spec when remote fetch fails"""
    mock_fetch = AsyncMock(return_value=None)
    mock_local = MagicMock(return_value=SAMPLE_SPEC)

    with (
        patch.object(api_spec_manager, "_fetch_remote_spec", mock_fetch),
        patch.object(api_spec_manager, "_load_local_spec", mock_local),
    ):
        await api_spec_manager.on_startup()

    assert api_spec_manager.spec == SAMPLE_SPEC
    mock_fetch.assert_called_once()
    mock_local.assert_called_once()


@pytest.mark.asyncio
async def test_startup_both_fail(api_spec_manager):
    """Test handling when both remote and local spec loading fail"""
    mock_fetch = AsyncMock(return_value=None)
    mock_local = MagicMock(side_effect=FileNotFoundError)

    with (
        patch.object(api_spec_manager, "_fetch_remote_spec", mock_fetch),
        patch.object(api_spec_manager, "_load_local_spec", mock_local),
        pytest.raises(FileNotFoundError),
    ):
        await api_spec_manager.on_startup()

    mock_fetch.assert_called_once()
    mock_local.assert_called_once()


# Get Spec Tests
def test_get_spec_success(api_spec_manager):
    """Test getting loaded spec"""
    api_spec_manager.spec = SAMPLE_SPEC
    result = api_spec_manager.get_spec()
    assert result == SAMPLE_SPEC


def test_get_spec_not_loaded(api_spec_manager):
    """Test error when spec not loaded"""
    api_spec_manager.spec = None
    with pytest.raises(ValueError, match="OpenAPI spec not loaded"):
        api_spec_manager.get_spec()
