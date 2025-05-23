import unittest
from experiment_simulator.simulator_core.engine import SimulationEngine
from experiment_simulator.simulator_core.base_experiment import Experiment
from experiment_simulator.experiments.chemistry.titration import TitrationExperiment

class TestSimulationEngine(unittest.TestCase):
    """
    Tests for the SimulationEngine class.
    """

    def test_run_experiment(self):
        """
        Test the run_experiment method of the SimulationEngine.
        """
        engine = SimulationEngine()
        # Using TitrationExperiment as a concrete implementation of Experiment
        experiment = TitrationExperiment(analyte_volume=50.0, analyte_concentration=0.05, titrant_concentration=0.1)
        
        results = engine.run_experiment(experiment)

        self.assertIsNotNone(results, "Results should not be None.")
        self.assertIsInstance(results, dict, "Results should be a dictionary.")
        
        # Check for expected keys in the results
        self.assertIn("titrant_volume_added", results, "Results should contain 'titrant_volume_added'.")
        self.assertIn("final_ph", results, "Results should contain 'final_ph'.")

        # Check specific deterministic value for TitrationExperiment
        # Expected titrant volume = (analyte_concentration * analyte_volume) / titrant_concentration
        # Expected titrant volume = (0.05 M * 50.0 mL) / 0.1 M = 2.5 / 0.1 = 25.0 mL
        self.assertAlmostEqual(results["titrant_volume_added"], 25.0, places=2, 
                               msg="Titrant volume added should be 25.0 mL for the given parameters.")
        self.assertEqual(results["final_ph"], experiment.endpoint_ph, 
                         "Final pH should be the endpoint pH defined in the experiment.")

if __name__ == '__main__':
    unittest.main()
