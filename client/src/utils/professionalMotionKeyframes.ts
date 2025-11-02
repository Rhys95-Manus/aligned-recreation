// Professional QB throwing motion keyframes
// Extracted from real QB video (FRONT-FACING, 3-4 seconds)
// Source: Facebook reel https://www.facebook.com/reel/1503596520253163
// 71% front-facing frames with excellent depth variation:
// - Shoulder depth: 0.583-0.867
// - Hip rotation: 0.007-0.221
// - Elbow range: 68.2° → 157.3° (89.1° total)

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export const PROFESSIONAL_KEYFRAMES: Landmark[][] = [
  // NEUTRAL - Frame 0 (3.00s)
  [
    { x: 0.5286, y: 0.3732, z: -0.1992, visibility: 1.0 },  // Landmark 0
    { x: 0.5436, y: 0.3582, z: -0.1902, visibility: 1.0 },  // Landmark 1
    { x: 0.5545, y: 0.3578, z: -0.1907, visibility: 1.0 },  // Landmark 2
    { x: 0.5665, y: 0.3578, z: -0.1906, visibility: 1.0 },  // Landmark 3
    { x: 0.5189, y: 0.3588, z: -0.1314, visibility: 1.0 },  // Landmark 4
    { x: 0.5108, y: 0.3589, z: -0.1322, visibility: 1.0 },  // Landmark 5
    { x: 0.5043, y: 0.359, z: -0.1325, visibility: 1.0 },  // Landmark 6
    { x: 0.5945, y: 0.3602, z: -0.08, visibility: 1.0 },  // Landmark 7
    { x: 0.5139, y: 0.362, z: 0.1839, visibility: 1.0 },  // Landmark 8
    { x: 0.5514, y: 0.384, z: -0.1493, visibility: 1.0 },  // Landmark 9
    { x: 0.5238, y: 0.3863, z: -0.0784, visibility: 1.0 },  // Landmark 10
    { x: 0.6394, y: 0.4254, z: -0.2275, visibility: 1.0 },  // Landmark 11
    { x: 0.5389, y: 0.4484, z: 0.5411, visibility: 0.9998 },  // Landmark 12
    { x: 0.6016, y: 0.5545, z: -0.3073, visibility: 0.9952 },  // Landmark 13
    { x: 0.542, y: 0.5584, z: 0.4743, visibility: 0.1729 },  // Landmark 14
    { x: 0.4383, y: 0.5694, z: -0.266, visibility: 0.9835 },  // Landmark 15
    { x: 0.4446, y: 0.5738, z: -0.0327, visibility: 0.4695 },  // Landmark 16
    { x: 0.3915, y: 0.5723, z: -0.3142, visibility: 0.9688 },  // Landmark 17
    { x: 0.4035, y: 0.5797, z: -0.0956, visibility: 0.575 },  // Landmark 18
    { x: 0.4054, y: 0.5497, z: -0.3049, visibility: 0.9685 },  // Landmark 19
    { x: 0.403, y: 0.5613, z: -0.1454, visibility: 0.5732 },  // Landmark 20
    { x: 0.4222, y: 0.5491, z: -0.2519, visibility: 0.9457 },  // Landmark 21
    { x: 0.4279, y: 0.5591, z: -0.0719, visibility: 0.5569 },  // Landmark 22
    { x: 0.6596, y: 0.6415, z: -0.2686, visibility: 0.9999 },  // Landmark 23
    { x: 0.5864, y: 0.643, z: 0.2684, visibility: 0.9999 },  // Landmark 24
    { x: 0.5284, y: 0.7809, z: -0.4896, visibility: 0.9829 },  // Landmark 25
    { x: 0.4294, y: 0.7951, z: -0.087, visibility: 0.8791 },  // Landmark 26
    { x: 0.6817, y: 0.9508, z: -0.4149, visibility: 0.95 },  // Landmark 27
    { x: 0.542, y: 0.9504, z: -0.0884, visibility: 0.866 },  // Landmark 28
    { x: 0.7207, y: 0.9748, z: -0.4178, visibility: 0.7807 },  // Landmark 29
    { x: 0.5821, y: 0.9736, z: -0.0964, visibility: 0.8354 },  // Landmark 30
    { x: 0.6022, y: 0.9985, z: -0.6153, visibility: 0.9315 },  // Landmark 31
    { x: 0.4333, y: 0.999, z: -0.2567, visibility: 0.8604 },  // Landmark 32
  ],
  // WIND-UP - Frame 2 (3.07s)
  [
    { x: 0.5304, y: 0.3758, z: -0.4485, visibility: 1.0 },  // Landmark 0
    { x: 0.547, y: 0.3592, z: -0.4513, visibility: 1.0 },  // Landmark 1
    { x: 0.5583, y: 0.3584, z: -0.4518, visibility: 1.0 },  // Landmark 2
    { x: 0.5688, y: 0.3581, z: -0.4517, visibility: 1.0 },  // Landmark 3
    { x: 0.5236, y: 0.3607, z: -0.3822, visibility: 1.0 },  // Landmark 4
    { x: 0.5168, y: 0.3609, z: -0.383, visibility: 1.0 },  // Landmark 5
    { x: 0.5106, y: 0.3609, z: -0.3834, visibility: 1.0 },  // Landmark 6
    { x: 0.5968, y: 0.3606, z: -0.3486, visibility: 1.0 },  // Landmark 7
    { x: 0.5228, y: 0.3633, z: -0.0354, visibility: 0.9999 },  // Landmark 8
    { x: 0.5525, y: 0.3856, z: -0.3967, visibility: 1.0 },  // Landmark 9
    { x: 0.526, y: 0.3884, z: -0.3115, visibility: 0.9999 },  // Landmark 10
    { x: 0.6439, y: 0.4265, z: -0.4667, visibility: 1.0 },  // Landmark 11
    { x: 0.5562, y: 0.448, z: 0.3998, visibility: 0.9998 },  // Landmark 12
    { x: 0.5839, y: 0.5549, z: -0.5868, visibility: 0.9949 },  // Landmark 13
    { x: 0.5461, y: 0.5595, z: 0.4283, visibility: 0.1642 },  // Landmark 14
    { x: 0.4226, y: 0.5764, z: -0.6054, visibility: 0.9826 },  // Landmark 15
    { x: 0.4306, y: 0.5812, z: 0.0564, visibility: 0.466 },  // Landmark 16
    { x: 0.3837, y: 0.5877, z: -0.6782, visibility: 0.9679 },  // Landmark 17
    { x: 0.3886, y: 0.5872, z: 0.0114, visibility: 0.5748 },  // Landmark 18
    { x: 0.3812, y: 0.5697, z: -0.6684, visibility: 0.9678 },  // Landmark 19
    { x: 0.3823, y: 0.5716, z: -0.0629, visibility: 0.575 },  // Landmark 20
    { x: 0.3958, y: 0.5645, z: -0.5936, visibility: 0.9441 },  // Landmark 21
    { x: 0.4023, y: 0.5664, z: 0.0105, visibility: 0.5603 },  // Landmark 22
    { x: 0.6617, y: 0.6465, z: -0.2916, visibility: 0.9999 },  // Landmark 23
    { x: 0.5897, y: 0.6475, z: 0.2914, visibility: 0.9999 },  // Landmark 24
    { x: 0.5598, y: 0.7859, z: -0.4856, visibility: 0.9845 },  // Landmark 25
    { x: 0.4296, y: 0.7995, z: 0.0228, visibility: 0.8924 },  // Landmark 26
    { x: 0.7135, y: 0.9518, z: -0.3054, visibility: 0.9567 },  // Landmark 27
    { x: 0.5421, y: 0.9546, z: 0.1787, visibility: 0.8816 },  // Landmark 28
    { x: 0.7506, y: 0.9748, z: -0.2983, visibility: 0.8044 },  // Landmark 29
    { x: 0.585, y: 0.9788, z: 0.1873, visibility: 0.8521 },  // Landmark 30
    { x: 0.6075, y: 1.0174, z: -0.5332, visibility: 0.9397 },  // Landmark 31
    { x: 0.4265, y: 0.9991, z: 0.0084, visibility: 0.8749 },  // Landmark 32
  ],
  // COCKING - Frame 5 (3.17s)
  [
    { x: 0.5343, y: 0.3769, z: -0.2056, visibility: 1.0 },  // Landmark 0
    { x: 0.5516, y: 0.3599, z: -0.2151, visibility: 1.0 },  // Landmark 1
    { x: 0.5626, y: 0.3589, z: -0.2155, visibility: 1.0 },  // Landmark 2
    { x: 0.5726, y: 0.3582, z: -0.2155, visibility: 1.0 },  // Landmark 3
    { x: 0.531, y: 0.3615, z: -0.1457, visibility: 1.0 },  // Landmark 4
    { x: 0.5265, y: 0.3615, z: -0.1465, visibility: 1.0 },  // Landmark 5
    { x: 0.5224, y: 0.3613, z: -0.1468, visibility: 1.0 },  // Landmark 6
    { x: 0.6025, y: 0.3609, z: -0.1693, visibility: 1.0 },  // Landmark 7
    { x: 0.5429, y: 0.3639, z: 0.1513, visibility: 0.9999 },  // Landmark 8
    { x: 0.5565, y: 0.3868, z: -0.1714, visibility: 0.9999 },  // Landmark 9
    { x: 0.5349, y: 0.3893, z: -0.0864, visibility: 0.9999 },  // Landmark 10
    { x: 0.6461, y: 0.4292, z: -0.339, visibility: 1.0 },  // Landmark 11
    { x: 0.5882, y: 0.4427, z: 0.5013, visibility: 0.9995 },  // Landmark 12
    { x: 0.5574, y: 0.5442, z: -0.4505, visibility: 0.9955 },  // Landmark 13
    { x: 0.6037, y: 0.5507, z: 0.5735, visibility: 0.1363 },  // Landmark 14
    { x: 0.4033, y: 0.5781, z: -0.4255, visibility: 0.9852 },  // Landmark 15
    { x: 0.5885, y: 0.6132, z: 0.2827, visibility: 0.371 },  // Landmark 16
    { x: 0.3645, y: 0.5925, z: -0.5008, visibility: 0.973 },  // Landmark 17
    { x: 0.5844, y: 0.6359, z: 0.2513, visibility: 0.4631 },  // Landmark 18
    { x: 0.3562, y: 0.578, z: -0.4758, visibility: 0.9731 },  // Landmark 19
    { x: 0.5718, y: 0.6335, z: 0.1926, visibility: 0.4649 },  // Landmark 20
    { x: 0.3703, y: 0.5734, z: -0.4073, visibility: 0.9524 },  // Landmark 21
    { x: 0.5765, y: 0.6243, z: 0.2467, visibility: 0.456 },  // Landmark 22
    { x: 0.6631, y: 0.6501, z: -0.2701, visibility: 0.9999 },  // Landmark 23
    { x: 0.5941, y: 0.6505, z: 0.2699, visibility: 0.9998 },  // Landmark 24
    { x: 0.5949, y: 0.7931, z: -0.4711, visibility: 0.9869 },  // Landmark 25
    { x: 0.4387, y: 0.8041, z: 0.0565, visibility: 0.9016 },  // Landmark 26
    { x: 0.7757, y: 0.9556, z: -0.3011, visibility: 0.9651 },  // Landmark 27
    { x: 0.5468, y: 0.9577, z: 0.1907, visibility: 0.8954 },  // Landmark 28
    { x: 0.8188, y: 0.977, z: -0.2964, visibility: 0.837 },  // Landmark 29
    { x: 0.5897, y: 0.9793, z: 0.1948, visibility: 0.8657 },  // Landmark 30
    { x: 0.7197, y: 1.0115, z: -0.5533, visibility: 0.9509 },  // Landmark 31
    { x: 0.4271, y: 0.9969, z: -0.0004, visibility: 0.8897 },  // Landmark 32
  ],
  // ACCELERATION - Frame 10 (3.33s)
  [
    { x: 0.5632, y: 0.3723, z: -0.1246, visibility: 0.9999 },  // Landmark 0
    { x: 0.5804, y: 0.357, z: -0.1381, visibility: 0.9999 },  // Landmark 1
    { x: 0.5905, y: 0.3564, z: -0.1386, visibility: 0.9999 },  // Landmark 2
    { x: 0.5995, y: 0.3557, z: -0.1386, visibility: 0.9999 },  // Landmark 3
    { x: 0.5597, y: 0.3576, z: -0.0725, visibility: 0.9999 },  // Landmark 4
    { x: 0.5549, y: 0.3572, z: -0.0733, visibility: 0.9999 },  // Landmark 5
    { x: 0.5504, y: 0.3566, z: -0.0736, visibility: 0.9999 },  // Landmark 6
    { x: 0.628, y: 0.3583, z: -0.1085, visibility: 1.0 },  // Landmark 7
    { x: 0.5701, y: 0.3597, z: 0.1882, visibility: 0.9997 },  // Landmark 8
    { x: 0.5856, y: 0.3819, z: -0.1001, visibility: 0.9998 },  // Landmark 9
    { x: 0.5618, y: 0.3833, z: -0.0198, visibility: 0.9995 },  // Landmark 10
    { x: 0.6595, y: 0.4205, z: -0.2709, visibility: 1.0 },  // Landmark 11
    { x: 0.6185, y: 0.4334, z: 0.4807, visibility: 0.9991 },  // Landmark 12
    { x: 0.5437, y: 0.51, z: -0.4251, visibility: 0.9966 },  // Landmark 13
    { x: 0.6285, y: 0.542, z: 0.5202, visibility: 0.0905 },  // Landmark 14
    { x: 0.3604, y: 0.527, z: -0.4312, visibility: 0.9896 },  // Landmark 15
    { x: 0.6009, y: 0.6101, z: 0.2496, visibility: 0.2273 },  // Landmark 16
    { x: 0.3144, y: 0.53, z: -0.502, visibility: 0.9809 },  // Landmark 17
    { x: 0.5913, y: 0.6318, z: 0.2233, visibility: 0.2878 },  // Landmark 18
    { x: 0.3144, y: 0.5207, z: -0.474, visibility: 0.9809 },  // Landmark 19
    { x: 0.595, y: 0.6328, z: 0.1639, visibility: 0.2891 },  // Landmark 20
    { x: 0.3327, y: 0.5222, z: -0.4127, visibility: 0.9648 },  // Landmark 21
    { x: 0.5984, y: 0.6239, z: 0.2138, visibility: 0.286 },  // Landmark 22
    { x: 0.6766, y: 0.6467, z: -0.2303, visibility: 0.9999 },  // Landmark 23
    { x: 0.5957, y: 0.6495, z: 0.23, visibility: 0.9998 },  // Landmark 24
    { x: 0.6702, y: 0.796, z: -0.3375, visibility: 0.988 },  // Landmark 25
    { x: 0.474, y: 0.8038, z: 0.0653, visibility: 0.8815 },  // Landmark 26
    { x: 0.8295, y: 0.9573, z: -0.2173, visibility: 0.9735 },  // Landmark 27
    { x: 0.5515, y: 0.955, z: 0.1774, visibility: 0.8979 },  // Landmark 28
    { x: 0.8625, y: 0.9771, z: -0.2192, visibility: 0.8651 },  // Landmark 29
    { x: 0.5918, y: 0.9772, z: 0.1796, visibility: 0.8646 },  // Landmark 30
    { x: 0.8328, y: 1.012, z: -0.4511, visibility: 0.9604 },  // Landmark 31
    { x: 0.4296, y: 0.9893, z: 0.0126, visibility: 0.8945 },  // Landmark 32
  ],
  // RELEASE - Frame 14 (3.47s)
  [
    { x: 0.5922, y: 0.3519, z: -0.2512, visibility: 0.9998 },  // Landmark 0
    { x: 0.6103, y: 0.3394, z: -0.2599, visibility: 0.9998 },  // Landmark 1
    { x: 0.6201, y: 0.3389, z: -0.2604, visibility: 0.9998 },  // Landmark 2
    { x: 0.6299, y: 0.3386, z: -0.2604, visibility: 0.9998 },  // Landmark 3
    { x: 0.5865, y: 0.34, z: -0.1966, visibility: 0.9997 },  // Landmark 4
    { x: 0.5809, y: 0.3398, z: -0.1973, visibility: 0.9997 },  // Landmark 5
    { x: 0.5761, y: 0.3392, z: -0.1977, visibility: 0.9997 },  // Landmark 6
    { x: 0.6561, y: 0.3411, z: -0.2096, visibility: 0.9999 },  // Landmark 7
    { x: 0.5906, y: 0.3412, z: 0.0822, visibility: 0.9992 },  // Landmark 8
    { x: 0.6107, y: 0.3628, z: -0.2174, visibility: 0.9995 },  // Landmark 9
    { x: 0.5867, y: 0.364, z: -0.1399, visibility: 0.999 },  // Landmark 10
    { x: 0.6959, y: 0.4048, z: -0.3255, visibility: 1.0 },  // Landmark 11
    { x: 0.6168, y: 0.4256, z: 0.3795, visibility: 0.9986 },  // Landmark 12
    { x: 0.608, y: 0.4885, z: -0.5454, visibility: 0.9938 },  // Landmark 13
    { x: 0.5955, y: 0.5114, z: 0.2127, visibility: 0.0653 },  // Landmark 14
    { x: 0.4201, y: 0.4555, z: -0.6866, visibility: 0.9873 },  // Landmark 15
    { x: 0.5167, y: 0.4775, z: -0.3376, visibility: 0.1599 },  // Landmark 16
    { x: 0.3679, y: 0.4463, z: -0.7415, visibility: 0.9799 },  // Landmark 17
    { x: 0.5125, y: 0.4813, z: -0.4199, visibility: 0.2129 },  // Landmark 18
    { x: 0.3697, y: 0.4346, z: -0.7442, visibility: 0.9797 },  // Landmark 19
    { x: 0.5027, y: 0.4667, z: -0.454, visibility: 0.2144 },  // Landmark 20
    { x: 0.3879, y: 0.4398, z: -0.6908, visibility: 0.961 },  // Landmark 21
    { x: 0.4917, y: 0.4686, z: -0.3728, visibility: 0.2124 },  // Landmark 22
    { x: 0.6932, y: 0.6434, z: -0.2087, visibility: 0.9999 },  // Landmark 23
    { x: 0.5947, y: 0.6464, z: 0.2084, visibility: 0.9998 },  // Landmark 24
    { x: 0.7069, y: 0.7949, z: -0.2359, visibility: 0.9822 },  // Landmark 25
    { x: 0.5037, y: 0.8008, z: 0.1374, visibility: 0.8584 },  // Landmark 26
    { x: 0.8337, y: 0.9542, z: -0.1106, visibility: 0.9733 },  // Landmark 27
    { x: 0.5462, y: 0.939, z: 0.3387, visibility: 0.8979 },  // Landmark 28
    { x: 0.8685, y: 0.9758, z: -0.114, visibility: 0.8528 },  // Landmark 29
    { x: 0.5819, y: 0.9575, z: 0.35, visibility: 0.8574 },  // Landmark 30
    { x: 0.8186, y: 1.0068, z: -0.3619, visibility: 0.9589 },  // Landmark 31
    { x: 0.4272, y: 0.9806, z: 0.186, visibility: 0.8945 },  // Landmark 32
  ],
  // FOLLOW-THROUGH - Frame 16 (3.53s)
  [
    { x: 0.6037, y: 0.346, z: -0.2343, visibility: 0.9998 },  // Landmark 0
    { x: 0.6213, y: 0.3321, z: -0.2425, visibility: 0.9997 },  // Landmark 1
    { x: 0.6313, y: 0.3317, z: -0.2432, visibility: 0.9998 },  // Landmark 2
    { x: 0.6416, y: 0.3316, z: -0.2432, visibility: 0.9998 },  // Landmark 3
    { x: 0.5961, y: 0.3325, z: -0.1876, visibility: 0.9997 },  // Landmark 4
    { x: 0.5906, y: 0.3322, z: -0.1884, visibility: 0.9997 },  // Landmark 5
    { x: 0.5851, y: 0.3315, z: -0.1888, visibility: 0.9996 },  // Landmark 6
    { x: 0.6659, y: 0.3345, z: -0.1815, visibility: 0.9999 },  // Landmark 7
    { x: 0.5975, y: 0.3333, z: 0.0733, visibility: 0.9991 },  // Landmark 8
    { x: 0.6228, y: 0.3571, z: -0.2018, visibility: 0.9994 },  // Landmark 9
    { x: 0.5955, y: 0.3578, z: -0.1348, visibility: 0.9989 },  // Landmark 10
    { x: 0.712, y: 0.3991, z: -0.2634, visibility: 1.0 },  // Landmark 11
    { x: 0.6177, y: 0.4232, z: 0.3192, visibility: 0.9986 },  // Landmark 12
    { x: 0.6431, y: 0.4819, z: -0.3939, visibility: 0.9889 },  // Landmark 13
    { x: 0.5498, y: 0.5027, z: 0.0649, visibility: 0.0631 },  // Landmark 14
    { x: 0.4548, y: 0.4404, z: -0.4099, visibility: 0.9804 },  // Landmark 15
    { x: 0.4903, y: 0.4623, z: -0.5098, visibility: 0.1511 },  // Landmark 16
    { x: 0.4072, y: 0.4279, z: -0.4676, visibility: 0.9719 },  // Landmark 17
    { x: 0.4759, y: 0.4679, z: -0.6044, visibility: 0.2135 },  // Landmark 18
    { x: 0.4158, y: 0.4162, z: -0.4528, visibility: 0.971 },  // Landmark 19
    { x: 0.4819, y: 0.4542, z: -0.6158, visibility: 0.2147 },  // Landmark 20
    { x: 0.4333, y: 0.4221, z: -0.3971, visibility: 0.945 },  // Landmark 21
    { x: 0.4631, y: 0.4526, z: -0.5357, visibility: 0.2101 },  // Landmark 22
    { x: 0.6945, y: 0.6386, z: -0.1831, visibility: 0.9999 },  // Landmark 23
    { x: 0.5913, y: 0.6415, z: 0.1827, visibility: 0.9998 },  // Landmark 24
    { x: 0.711, y: 0.7897, z: -0.1759, visibility: 0.9771 },  // Landmark 25
    { x: 0.5087, y: 0.798, z: 0.2109, visibility: 0.8315 },  // Landmark 26
    { x: 0.83, y: 0.9479, z: -0.0775, visibility: 0.9723 },  // Landmark 27
    { x: 0.5364, y: 0.9312, z: 0.4524, visibility: 0.8943 },  // Landmark 28
    { x: 0.8635, y: 0.9714, z: -0.0854, visibility: 0.8381 },  // Landmark 29
    { x: 0.5707, y: 0.9501, z: 0.4664, visibility: 0.8466 },  // Landmark 30
    { x: 0.8136, y: 0.9979, z: -0.3575, visibility: 0.9576 },  // Landmark 31
    { x: 0.4222, y: 0.9768, z: 0.2911, visibility: 0.8925 },  // Landmark 32
  ],
];

/**
 * Interpolate between keyframes based on progress (0-1)
 * Returns smoothly interpolated landmark positions for any point in the throwing motion
 */
export function interpolateKeyframes(progress: number): Landmark[] {
  const numKeyframes = PROFESSIONAL_KEYFRAMES.length;
  const scaledProgress = progress * (numKeyframes - 1);
  const keyframeIndex = Math.floor(scaledProgress);
  const t = scaledProgress - keyframeIndex;
  
  if (keyframeIndex >= numKeyframes - 1) {
    return PROFESSIONAL_KEYFRAMES[numKeyframes - 1];
  }
  
  const keyframe1 = PROFESSIONAL_KEYFRAMES[keyframeIndex];
  const keyframe2 = PROFESSIONAL_KEYFRAMES[keyframeIndex + 1];
  
  return keyframe1.map((lm1, i) => {
    const lm2 = keyframe2[i];
    return {
      x: lm1.x + (lm2.x - lm1.x) * t,
      y: lm1.y + (lm2.y - lm1.y) * t,
      z: lm1.z + (lm2.z - lm1.z) * t,
      visibility: lm1.visibility || 1.0
    };
  });
}
