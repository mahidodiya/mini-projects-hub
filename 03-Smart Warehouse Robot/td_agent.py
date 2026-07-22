class TDAgent:
    """
    Temporal Difference (TD(0)) Learning Agent.
    """
    
    def __init__(self):
         """Initialize the TD agent."""
         
         self.value_table = {}
         