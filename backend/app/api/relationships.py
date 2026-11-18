from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import RiskRelationship
from app.schemas.pydantic_models import RiskRelationshipResponse, GraphNode, GraphEdge

router = APIRouter(prefix="/scans", tags=["Risk Relationships"])

@router.get("/{scan_id}/relationships", response_model=list[RiskRelationshipResponse])
def get_scan_relationships(scan_id: str, db: Session = Depends(get_db)):
    rels = db.query(RiskRelationship).filter(RiskRelationship.scan_id == scan_id).all()
    results = []

    for r in rels:
        graph = r.get_graph()
        nodes = [GraphNode(**n) for n in graph.get("nodes", [])]
        edges = [GraphEdge(**e) for e in graph.get("edges", [])]

        results.append(RiskRelationshipResponse(
            id=r.id,
            scan_id=r.scan_id,
            cluster_name=r.cluster_name,
            severity=r.severity,
            affected_workflow=r.affected_workflow,
            narrative=r.narrative,
            node_ids=r.node_ids_data if isinstance(r.node_ids_data, list) else [],
            nodes=nodes,
            edges=edges,
            created_at=r.created_at
        ))
    return results
