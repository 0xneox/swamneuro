// Compute shader implementation
export const createComputeShader = () => {
  return `
    @group(0) @binding(0) var<storage, read> matrixA : array<f32>;
    @group(0) @binding(1) var<storage, read> matrixB : array<f32>;
    @group(0) @binding(2) var<storage, write> result : array<f32>;
    
    struct Dimensions {
      width : u32,
      height : u32,
      depth : u32,
    }
    
    @group(0) @binding(3) var<uniform> dimensions : Dimensions;
    
    @compute @workgroup_size(8, 8, 1)
    fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
      let row = global_id.x;
      let col = global_id.y;
      
      if (row >= dimensions.height || col >= dimensions.width) {
        return;
      }
      
      var sum = 0.0;
      for (var i = 0u; i < dimensions.depth; i = i + 1u) {
        sum = sum + matrixA[row * dimensions.depth + i] * 
                    matrixB[i * dimensions.width + col];
      }
      
      result[row * dimensions.width + col] = sum;
    }
  `;
};
