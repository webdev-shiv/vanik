import os
import json
import joblib
from typing import Any, Dict, Optional
from app.utils.logger import logger

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'models'))
METADATA_PATH = os.path.join(MODELS_DIR, 'model_metadata.json')

class ModelRegistry:
    _instance = None
    _loaded_models: Dict[str, Any] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelRegistry, cls).__new__(cls)
            cls._instance._loaded_models = {}
            os.makedirs(MODELS_DIR, exist_ok=True)
        return cls._instance

    def load_model(self, model_key: str, fallback_filename: str) -> Optional[Any]:
        if model_key in self._loaded_models:
            return self._loaded_models[model_key]

        model_path = os.path.join(MODELS_DIR, fallback_filename)
        if os.path.exists(model_path):
            try:
                model = joblib.load(model_path)
                self._loaded_models[model_key] = model
                logger.info(f'Successfully loaded model {model_key} from {fallback_filename}')
                return model
            except Exception as e:
                logger.error(f'Error loading model {model_key} from {fallback_filename}: {e}')
                return None
        else:
            logger.warning(f'Model file not found: {model_path}. Service will run with deterministic baseline.')
            return None

    def get_metadata(self) -> Dict[str, Any]:
        if os.path.exists(METADATA_PATH):
            try:
                with open(METADATA_PATH, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f'Error reading model metadata: {e}')
        return {'version': '1.0.0', 'models': {}}

    def register_metadata(self, model_name: str, version: str, metrics: Dict[str, Any], features: list):
        current_meta = self.get_metadata()
        current_meta['models'][model_name] = {
            'version': version,
            'metrics': metrics,
            'features': features,
            'artifact': f'{model_name}_{version}.joblib'
        }
        with open(METADATA_PATH, 'w', encoding='utf-8') as f:
            json.dump(current_meta, f, indent=2)
        logger.info(f'Registered metadata for {model_name} ({version})')

model_registry = ModelRegistry()
