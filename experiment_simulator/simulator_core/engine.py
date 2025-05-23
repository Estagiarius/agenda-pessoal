from .base_experiment import Experiment

class SimulationEngine:
    """
    Manages the execution of experiments.
    """

    def __init__(self):
        """
        Initialize the simulation engine.
        """
        pass

    def run_experiment(self, experiment: Experiment):
        """
        Run a given experiment.

        Args:
            experiment: An instance of a class that inherits from Experiment.

        Returns:
            The results of the experiment.
        """
        experiment.setup()
        experiment.run()
        results = experiment.get_results()
        return results
