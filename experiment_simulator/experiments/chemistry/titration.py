from experiment_simulator.simulator_core.base_experiment import Experiment

class TitrationExperiment(Experiment):
    """
    Simulates a simple acid-base titration.
    """

    def __init__(self, analyte_volume=25.0, analyte_concentration=0.1, titrant_concentration=0.1):
        """
        Initialize the titration experiment.

        Args:
            analyte_volume (float): Initial volume of the analyte in mL.
            analyte_concentration (float): Concentration of the analyte in M.
            titrant_concentration (float): Concentration of the titrant in M.
        """
        self.analyte_volume = analyte_volume
        self.analyte_concentration = analyte_concentration
        self.titrant_concentration = titrant_concentration
        self.endpoint_ph = 7.0
        # Assuming a strong acid titrated with a strong base, initial pH is acidic.
        self.initial_ph = 3.0  # Example initial pH
        self.current_ph = self.initial_ph
        self.titrant_added_volume = 0.0

    def setup(self):
        """
        Set up the Titration Experiment.
        Resets titrant added volume and pH to initial state.
        """
        self.titrant_added_volume = 0.0
        self.current_ph = self.initial_ph
        print(
            f"Setting up Titration Experiment: "
            f"Analyte volume: {self.analyte_volume} mL, "
            f"Analyte concentration: {self.analyte_concentration} M, "
            f"Titrant concentration: {self.titrant_concentration} M."
        )

    def run(self):
        """
        Run the titration experiment.
        Simulates adding titrant until the stoichiometric endpoint is reached.
        """
        print("Running Titration: Adding titrant...")
        
        # Calculate the stoichiometric volume of titrant needed (assuming 1:1 molar ratio)
        # M1V1 = M2V2  => V2 = (M1V1) / M2
        stoichiometric_volume = (self.analyte_concentration * self.analyte_volume) / self.titrant_concentration
        
        # Simulate adding this volume of titrant
        self.titrant_added_volume = stoichiometric_volume
        
        # Simulate pH change to endpoint pH
        self.current_ph = self.endpoint_ph
        
        print(f"Endpoint reached. Titrant added: {self.titrant_added_volume:.2f} mL.")

    def get_results(self):
        """
        Get the results of the titration experiment.

        Returns:
            dict: A dictionary summarizing the experiment results.
        """
        results = {
            "titrant_volume_added": self.titrant_added_volume,
            "final_ph": self.current_ph,
            "analyte_volume": self.analyte_volume,
            "analyte_concentration": self.analyte_concentration,
            "titrant_concentration": self.titrant_concentration
        }
        print(f"Titration Results: {results}")
        return results
