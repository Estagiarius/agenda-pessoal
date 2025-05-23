// js/app/projectService.js

const projectService = {
    getProjects: function() {
        return fetch('/api/projects')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
    },

    createProject: function(projectData) {
        return fetch('/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData),
        })
        .then(response => {
            if (!response.ok) {
                // Attempt to get error message from server response
                return response.json().then(err => {
                    throw new Error(err.error || 'Network response was not ok ' + response.statusText);
                });
            }
            if (response.status === 201) { // Successfully created
                return response.json();
            }
            return response; // Or handle other statuses as needed
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            throw error; // Re-throw to allow caller to handle
        });
    },

    getProjectDetails: function(projectId) {
        return fetch(`/api/projects/${projectId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok for getProjectDetails: ' + response.statusText);
                }
                return response.json();
            })
            .catch(error => {
                console.error('Error in getProjectDetails:', error);
                throw error;
            });
    },

    getParts: function(projectId) {
        return fetch(`/api/projects/${projectId}/parts`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok for getParts: ' + response.statusText);
                }
                return response.json();
            })
            .catch(error => {
                console.error('Error in getParts:', error);
                throw error;
            });
    },

    createPart: function(projectId, partData) {
        return fetch(`/api/projects/${projectId}/parts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(partData),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Network response was not ok for createPart'); });
            }
            if (response.status === 201) return response.json();
            return response;
        })
        .catch(error => {
            console.error('Error in createPart:', error);
            throw error;
        });
    },

    getTasks: function(projectId) {
        return fetch(`/api/projects/${projectId}/tasks`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok for getTasks: ' + response.statusText);
                }
                return response.json();
            })
            .catch(error => {
                console.error('Error in getTasks:', error);
                throw error;
            });
    },

    createTask: function(projectId, taskData) {
        return fetch(`/api/projects/${projectId}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Network response was not ok for createTask'); });
            }
            if (response.status === 201) return response.json();
            return response;
        })
        .catch(error => {
            console.error('Error in createTask:', error);
            throw error;
        });
    },

    getDocuments: function(projectId) {
        // Fetches list of documents (id, title)
        return fetch(`/api/projects/${projectId}/documents`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok for getDocuments: ' + response.statusText);
                }
                return response.json();
            })
            .catch(error => {
                console.error('Error in getDocuments:', error);
                throw error;
            });
    },
    
    // getFullDocument: function(projectId, documentId) { // Example for later
    //     return fetch(`/api/projects/${projectId}/documents/${documentId}`)
    //         .then(response => response.json());
    // },

    createDocument: function(projectId, documentData) {
        // documentData should contain { title: "...", content: "..." }
        return fetch(`/api/projects/${projectId}/documents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(documentData),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Network response was not ok for createDocument'); });
            }
            if (response.status === 201) return response.json(); // API returns {id, title, project_id}
            return response;
        })
        .catch(error => {
            console.error('Error in createDocument:', error);
            throw error;
        });
    }
};

// Export if using modules, otherwise it's globally available via projectService
// export default projectService; // Uncomment if you set up ES module support
// For now, ensure this script is loaded before router.js in index.html
// <script src="js/app/projectService.js"></script>
// <script src="js/app/router.js"></script>
