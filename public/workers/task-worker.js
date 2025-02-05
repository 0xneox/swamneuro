// Web Worker for handling Light Node tasks
self.onmessage = async function(e) {
    const task = e.data;
    
    try {
        const result = await processTask(task);
        self.postMessage(result);
    } catch (error) {
        self.postMessage({
            error: error.message,
            task: task.id
        });
    }
};

async function processTask(task) {
    switch (task.type) {
        case 'inference':
            return await handleInference(task);
        case 'preprocessing':
            return await handlePreprocessing(task);
        case 'validation':
            return await handleValidation(task);
        default:
            throw new Error(`Unknown task type: ${task.type}`);
    }
}

async function handleInference(task) {
    const { model, input } = task;
    
    // Simple inference using basic math operations
    // In a real implementation, this would use ONNX Runtime Web or TensorFlow.js
    const result = new Float32Array(input.length);
    for (let i = 0; i < input.length; i++) {
        result[i] = Math.tanh(input[i]); // Simple activation function
    }
    
    return {
        success: true,
        result: Array.from(result),
        metrics: {
            duration: performance.now() - task.startTime,
            memoryUsed: 0 // Would be measured in actual implementation
        }
    };
}

async function handlePreprocessing(task) {
    const { data, options } = task;
    
    // Simple data preprocessing
    const result = data.map(item => {
        if (options.normalize) {
            return item / 255.0; // Simple normalization
        }
        return item;
    });
    
    return {
        success: true,
        result,
        metrics: {
            duration: performance.now() - task.startTime,
            itemsProcessed: data.length
        }
    };
}

async function handleValidation(task) {
    const { predictions, targets } = task;
    
    // Simple validation metrics
    let correct = 0;
    let total = predictions.length;
    
    for (let i = 0; i < total; i++) {
        if (Math.abs(predictions[i] - targets[i]) < 0.1) {
            correct++;
        }
    }
    
    return {
        success: true,
        result: {
            accuracy: correct / total,
            total,
            correct
        },
        metrics: {
            duration: performance.now() - task.startTime
        }
    };
}

// Helper functions for common operations
function normalizeArray(arr) {
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    return arr.map(x => (x - min) / (max - min));
}

function standardizeArray(arr) {
    const mean = arr.reduce((a, b) => a + b) / arr.length;
    const std = Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length);
    return arr.map(x => (x - mean) / std);
}

// Error handling wrapper
function safeExecute(fn) {
    return async function(...args) {
        try {
            return await fn.apply(this, args);
        } catch (error) {
            console.error(`Error in ${fn.name}:`, error);
            throw error;
        }
    };
}

// Wrap all handler functions with error handling
const handlers = {
    inference: safeExecute(handleInference),
    preprocessing: safeExecute(handlePreprocessing),
    validation: safeExecute(handleValidation)
};
