"""
LangGraph pipeline wiring — a deterministic StateGraph, not an autonomous
agent swarm (spec §4). Every node calls OpenAI directly with structured
output; edges are fixed and sequential/fan-out-fan-in, never decided by the
model itself.

    claim_analyst -> evidence_researcher -> cross_checker
                                                  |
                                    +-------------+-------------+
                                    v                             v
                                red_team                 publication_risk
                                    +-------------+-------------+
                                                  v
                                             synthesizer
"""

from langgraph.graph import END, START, StateGraph

from pipeline.nodes import claim_analyst, cross_checker, evidence_researcher, publication_risk, red_team, synthesizer
from pipeline.state import PipelineState

_compiled_graph = None


def build_graph():
    """Construct and compile the review pipeline graph."""
    graph = StateGraph(PipelineState)

    graph.add_node("claim_analyst", claim_analyst.run)
    graph.add_node("evidence_researcher", evidence_researcher.run)
    graph.add_node("cross_checker", cross_checker.run)
    graph.add_node("red_team", red_team.run)
    graph.add_node("publication_risk", publication_risk.run)
    graph.add_node("synthesizer", synthesizer.run)

    graph.add_edge(START, "claim_analyst")
    graph.add_edge("claim_analyst", "evidence_researcher")
    graph.add_edge("evidence_researcher", "cross_checker")
    graph.add_edge("cross_checker", "red_team")
    graph.add_edge("cross_checker", "publication_risk")
    graph.add_edge("red_team", "synthesizer")
    graph.add_edge("publication_risk", "synthesizer")
    graph.add_edge("synthesizer", END)

    return graph.compile()


def get_graph():
    """Return a lazily-compiled, cached singleton of the review pipeline graph."""
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_graph()
    return _compiled_graph
