from fastapi import APIRouter, WebSocket
from app.websocket.manager import manager

router = APIRouter(prefix="/ws", tags=["ws"])

@router.websocket('/chat')
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"Message: {data}")
    except Exception:
        manager.disconnect(websocket)
