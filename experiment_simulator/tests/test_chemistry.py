import unittest
from experiment_simulator.experiments.chemistry.titration import TitrationExperiment

class TestTitrationExperiment(unittest.TestCase):
    """
    Tests for the TitrationExperiment class.
    """

    def test_setup_initializes_values(self):
        """
        Test that setup initializes/resets values correctly.
        """
        experiment = TitrationExperiment(analyte_volume=50.0, analyte_concentration=0.2, titrant_concentration=0.1)
        # Change some values that setup should reset
        experiment.titrant_added_volume = 10.0
        experiment.current_ph = 5.0
        
        experiment.setup()
        
        self.assertEqual(experiment.titrant_added_volume, 0.0, "Titrant added volume should be reset to 0.0 after setup.")
        self.assertEqual(experiment.current_ph, experiment.initial_ph, 
                         f"Current pH should be reset to initial_ph ({experiment.initial_ph}) after setup.")

    def test_run_calculates_titrant(self):
        """
        Test that run calculates the titrant volume and sets pH correctly.
        """
        analyte_vol = 25.0
        analyte_conc = 0.1
        titrant_conc = 0.1
        experiment = TitrationExperiment(analyte_volume=analyte_vol, 
                                         analyte_concentration=analyte_conc, 
                                         titrant_concentration=titrant_conc)
        experiment.setup()
        experiment.run()

        expected_titrant_volume = (analyte_conc * analyte_vol) / titrant_conc
        self.assertAlmostEqual(experiment.titrant_added_volume, expected_titrant_volume, places=2,
                               msg=f"Titrant added volume should be close to {expected_titrant_volume:.2f} mL.")
        self.assertEqual(experiment.current_ph, experiment.endpoint_ph,
                         f"Current pH should be equal to endpoint_ph ({experiment.endpoint_ph}) after run.")

    def test_get_results_returns_expected_format(self):
        """
        Test that get_results returns a dictionary with the expected keys.
        """
        experiment = TitrationExperiment()
        experiment.setup()
        experiment.run()
        results = experiment.get_results()

        self.assertIsInstance(results, dict, "Results should be a dictionary.")
        self.assertIn("titrant_volume_added", results, "Results should contain 'titrant_volume_added' key.")
        self.assertIn("final_ph", results, "Results should contain 'final_ph' key.")
        self.assertIn("analyte_volume", results, "Results should contain 'analyte_volume' key.")
        self.assertIn("analyte_concentration", results, "Results should contain 'analyte_concentration' key.")
        self.assertIn("titrant_concentration", results, "Results should contain 'titrant_concentration' key.")

        # Check if the values in the results match the experiment's state
        self.assertEqual(results["titrant_volume_added"], experiment.titrant_added_volume)
        self.assertEqual(results["final_ph"], experiment.current_ph)

if __name__ == '__main__':
    unittest.main()
