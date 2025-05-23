from abc import ABCMeta, abstractmethod

class Experiment(metaclass=ABCMeta):
    """
    Abstract base class for all experiments.
    """

    @abstractmethod
    def setup(self):
        """
        Set up the experiment.
        """
        pass

    @abstractmethod
    def run(self):
        """
        Run the experiment.
        """
        pass

    @abstractmethod
    def get_results(self):
        """
        Get the results of the experiment.
        """
        pass
