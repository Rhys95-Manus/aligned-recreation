// Professional quarterback throwing motion keyframes
// Extracted from real QB video (FRONT-FACING, seconds 6-7)
// 6 keyframes: Neutral, Wind-up, Cocking, Acceleration, Release, Follow-through

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export const PROFESSIONAL_KEYFRAMES: Landmark[][] = [
  // NEUTRAL - Frame 180 (6.00s)
  [
    { x: 0.530146, y: 0.370254, z: -0.487681, visibility: 0.999812 },  // Landmark 0
    { x: 0.545567, y: 0.353137, z: -0.488857, visibility: 0.999623 },  // Landmark 1
    { x: 0.557145, y: 0.352081, z: -0.489366, visibility: 0.999599 },  // Landmark 2
    { x: 0.568583, y: 0.351437, z: -0.489278, visibility: 0.999652 },  // Landmark 3
    { x: 0.522819, y: 0.355367, z: -0.423627, visibility: 0.999711 },  // Landmark 4
    { x: 0.515876, y: 0.355482, z: -0.424368, visibility: 0.999750 },  // Landmark 5
    { x: 0.509539, y: 0.355708, z: -0.424778, visibility: 0.999801 },  // Landmark 6
    { x: 0.593605, y: 0.354990, z: -0.378276, visibility: 0.999615 },  // Landmark 7
    { x: 0.515776, y: 0.359101, z: -0.083701, visibility: 0.999467 },  // Landmark 8
    { x: 0.550727, y: 0.379655, z: -0.432603, visibility: 0.999481 },  // Landmark 9
    { x: 0.524750, y: 0.383549, z: -0.352401, visibility: 0.999504 },  // Landmark 10
    { x: 0.643377, y: 0.423752, z: -0.480467, visibility: 0.999933 },  // Landmark 11
    { x: 0.550118, y: 0.445288, z: 0.356885, visibility: 0.999747 },  // Landmark 12
    { x: 0.581231, y: 0.556591, z: -0.602242, visibility: 0.866106 },  // Landmark 13
    { x: 0.535587, y: 0.557149, z: 0.414094, visibility: 0.310937 },  // Landmark 14
    { x: 0.418653, y: 0.581171, z: -0.638491, visibility: 0.857055 },  // Landmark 15
    { x: 0.422853, y: 0.575348, z: 0.021982, visibility: 0.511542 },  // Landmark 16
    { x: 0.380457, y: 0.590159, z: -0.714722, visibility: 0.858174 },  // Landmark 17
    { x: 0.379396, y: 0.583831, z: -0.023504, visibility: 0.602628 },  // Landmark 18
    { x: 0.380347, y: 0.571652, z: -0.705652, visibility: 0.862305 },  // Landmark 19
    { x: 0.373521, y: 0.568538, z: -0.096214, visibility: 0.603769 },  // Landmark 20
    { x: 0.395559, y: 0.567712, z: -0.627716, visibility: 0.826675 },  // Landmark 21
    { x: 0.393558, y: 0.564002, z: -0.022955, visibility: 0.563829 },  // Landmark 22
    { x: 0.660794, y: 0.648680, z: -0.288680, visibility: 0.999821 },  // Landmark 23
    { x: 0.588571, y: 0.651453, z: 0.288440, visibility: 0.999776 },  // Landmark 24
    { x: 0.555912, y: 0.788664, z: -0.515833, visibility: 0.937202 },  // Landmark 25
    { x: 0.457138, y: 0.801713, z: 0.047105, visibility: 0.679660 },  // Landmark 26
    { x: 0.729669, y: 0.954669, z: -0.350832, visibility: 0.922765 },  // Landmark 27
    { x: 0.544656, y: 0.959032, z: 0.208470, visibility: 0.722043 },  // Landmark 28
    { x: 0.771020, y: 0.977914, z: -0.341066, visibility: 0.778841 },  // Landmark 29
    { x: 0.586845, y: 0.978202, z: 0.216052, visibility: 0.688302 },  // Landmark 30
    { x: 0.639438, y: 1.007802, z: -0.619887, visibility: 0.922067 },  // Landmark 31
    { x: 0.421240, y: 0.999075, z: 0.022409, visibility: 0.754237 },  // Landmark 32
  ],
  // WINDUP - Frame 185 (6.17s)
  [
    { x: 0.543426, y: 0.375373, z: -0.156292, visibility: 0.999864 },  // Landmark 0
    { x: 0.559311, y: 0.358812, z: -0.168471, visibility: 0.999752 },  // Landmark 1
    { x: 0.568986, y: 0.357553, z: -0.168962, visibility: 0.999738 },  // Landmark 2
    { x: 0.577995, y: 0.356600, z: -0.168908, visibility: 0.999773 },  // Landmark 3
    { x: 0.539259, y: 0.360513, z: -0.098927, visibility: 0.999801 },  // Landmark 4
    { x: 0.534766, y: 0.360579, z: -0.099679, visibility: 0.999820 },  // Landmark 5
    { x: 0.530982, y: 0.360369, z: -0.100044, visibility: 0.999850 },  // Landmark 6
    { x: 0.610300, y: 0.359510, z: -0.129856, visibility: 0.999757 },  // Landmark 7
    { x: 0.551948, y: 0.363196, z: 0.182977, visibility: 0.999595 },  // Landmark 8
    { x: 0.567383, y: 0.384849, z: -0.128906, visibility: 0.999623 },  // Landmark 9
    { x: 0.544393, y: 0.388094, z: -0.043511, visibility: 0.999565 },  // Landmark 10
    { x: 0.645941, y: 0.426843, z: -0.293334, visibility: 0.999944 },  // Landmark 11
    { x: 0.618787, y: 0.439185, z: 0.505389, visibility: 0.999442 },  // Landmark 12
    { x: 0.547202, y: 0.527703, z: -0.436326, visibility: 0.919073 },  // Landmark 13
    { x: 0.633229, y: 0.552366, z: 0.541135, visibility: 0.208446 },  // Landmark 14
    { x: 0.380787, y: 0.568350, z: -0.452350, visibility: 0.910445 },  // Landmark 15
    { x: 0.616784, y: 0.634074, z: 0.262556, visibility: 0.355913 },  // Landmark 16
    { x: 0.341830, y: 0.577295, z: -0.533457, visibility: 0.907933 },  // Landmark 17
    { x: 0.613676, y: 0.660759, z: 0.230949, visibility: 0.429685 },  // Landmark 18
    { x: 0.334329, y: 0.569651, z: -0.505048, visibility: 0.910680 },  // Landmark 19
    { x: 0.603137, y: 0.660043, z: 0.172596, visibility: 0.432400 },  // Landmark 20
    { x: 0.350691, y: 0.566815, z: -0.434724, visibility: 0.882329 },  // Landmark 21
    { x: 0.606719, y: 0.649355, z: 0.227094, visibility: 0.409802 },  // Landmark 22
    { x: 0.666822, y: 0.648092, z: -0.268977, visibility: 0.999841 },  // Landmark 23
    { x: 0.597415, y: 0.649531, z: 0.268648, visibility: 0.999776 },  // Landmark 24
    { x: 0.634061, y: 0.795605, z: -0.422367, visibility: 0.959663 },  // Landmark 25
    { x: 0.454674, y: 0.804759, z: 0.096252, visibility: 0.770983 },  // Landmark 26
    { x: 0.806231, y: 0.957465, z: -0.286618, visibility: 0.949666 },  // Landmark 27
    { x: 0.552157, y: 0.956162, z: 0.259651, visibility: 0.806433 },  // Landmark 28
    { x: 0.849125, y: 0.978530, z: -0.286914, visibility: 0.837012 },  // Landmark 29
    { x: 0.592591, y: 0.976540, z: 0.266661, visibility: 0.772677 },  // Landmark 30
    { x: 0.765667, y: 1.005265, z: -0.552481, visibility: 0.946438 },  // Landmark 31
    { x: 0.431711, y: 0.990905, z: 0.082754, visibility: 0.824692 },  // Landmark 32
  ],
  // COCKING - Frame 180 (6.00s)
  [
    { x: 0.530146, y: 0.370254, z: -0.487681, visibility: 0.999812 },  // Landmark 0
    { x: 0.545567, y: 0.353137, z: -0.488857, visibility: 0.999623 },  // Landmark 1
    { x: 0.557145, y: 0.352081, z: -0.489366, visibility: 0.999599 },  // Landmark 2
    { x: 0.568583, y: 0.351437, z: -0.489278, visibility: 0.999652 },  // Landmark 3
    { x: 0.522819, y: 0.355367, z: -0.423627, visibility: 0.999711 },  // Landmark 4
    { x: 0.515876, y: 0.355482, z: -0.424368, visibility: 0.999750 },  // Landmark 5
    { x: 0.509539, y: 0.355708, z: -0.424778, visibility: 0.999801 },  // Landmark 6
    { x: 0.593605, y: 0.354990, z: -0.378276, visibility: 0.999615 },  // Landmark 7
    { x: 0.515776, y: 0.359101, z: -0.083701, visibility: 0.999467 },  // Landmark 8
    { x: 0.550727, y: 0.379655, z: -0.432603, visibility: 0.999481 },  // Landmark 9
    { x: 0.524750, y: 0.383549, z: -0.352401, visibility: 0.999504 },  // Landmark 10
    { x: 0.643377, y: 0.423752, z: -0.480467, visibility: 0.999933 },  // Landmark 11
    { x: 0.550118, y: 0.445288, z: 0.356885, visibility: 0.999747 },  // Landmark 12
    { x: 0.581231, y: 0.556591, z: -0.602242, visibility: 0.866106 },  // Landmark 13
    { x: 0.535587, y: 0.557149, z: 0.414094, visibility: 0.310937 },  // Landmark 14
    { x: 0.418653, y: 0.581171, z: -0.638491, visibility: 0.857055 },  // Landmark 15
    { x: 0.422853, y: 0.575348, z: 0.021982, visibility: 0.511542 },  // Landmark 16
    { x: 0.380457, y: 0.590159, z: -0.714722, visibility: 0.858174 },  // Landmark 17
    { x: 0.379396, y: 0.583831, z: -0.023504, visibility: 0.602628 },  // Landmark 18
    { x: 0.380347, y: 0.571652, z: -0.705652, visibility: 0.862305 },  // Landmark 19
    { x: 0.373521, y: 0.568538, z: -0.096214, visibility: 0.603769 },  // Landmark 20
    { x: 0.395559, y: 0.567712, z: -0.627716, visibility: 0.826675 },  // Landmark 21
    { x: 0.393558, y: 0.564002, z: -0.022955, visibility: 0.563829 },  // Landmark 22
    { x: 0.660794, y: 0.648680, z: -0.288680, visibility: 0.999821 },  // Landmark 23
    { x: 0.588571, y: 0.651453, z: 0.288440, visibility: 0.999776 },  // Landmark 24
    { x: 0.555912, y: 0.788664, z: -0.515833, visibility: 0.937202 },  // Landmark 25
    { x: 0.457138, y: 0.801713, z: 0.047105, visibility: 0.679660 },  // Landmark 26
    { x: 0.729669, y: 0.954669, z: -0.350832, visibility: 0.922765 },  // Landmark 27
    { x: 0.544656, y: 0.959032, z: 0.208470, visibility: 0.722043 },  // Landmark 28
    { x: 0.771020, y: 0.977914, z: -0.341066, visibility: 0.778841 },  // Landmark 29
    { x: 0.586845, y: 0.978202, z: 0.216052, visibility: 0.688302 },  // Landmark 30
    { x: 0.639438, y: 1.007802, z: -0.619887, visibility: 0.922067 },  // Landmark 31
    { x: 0.421240, y: 0.999075, z: 0.022409, visibility: 0.754237 },  // Landmark 32
  ],
  // ACCELERATION - Frame 182 (6.07s)
  [
    { x: 0.531820, y: 0.375077, z: -0.444005, visibility: 0.999840 },  // Landmark 0
    { x: 0.547682, y: 0.358141, z: -0.446958, visibility: 0.999685 },  // Landmark 1
    { x: 0.559257, y: 0.356782, z: -0.447448, visibility: 0.999664 },  // Landmark 2
    { x: 0.570485, y: 0.355868, z: -0.447334, visibility: 0.999708 },  // Landmark 3
    { x: 0.524539, y: 0.360246, z: -0.381488, visibility: 0.999757 },  // Landmark 4
    { x: 0.517164, y: 0.360192, z: -0.382219, visibility: 0.999788 },  // Landmark 5
    { x: 0.511345, y: 0.359915, z: -0.382618, visibility: 0.999830 },  // Landmark 6
    { x: 0.594102, y: 0.358680, z: -0.349335, visibility: 0.999679 },  // Landmark 7
    { x: 0.523196, y: 0.362022, z: -0.076580, visibility: 0.999539 },  // Landmark 8
    { x: 0.552599, y: 0.384352, z: -0.393422, visibility: 0.999554 },  // Landmark 9
    { x: 0.526348, y: 0.387323, z: -0.313508, visibility: 0.999554 },  // Landmark 10
    { x: 0.644953, y: 0.426612, z: -0.457932, visibility: 0.999932 },  // Landmark 11
    { x: 0.571821, y: 0.445121, z: 0.384603, visibility: 0.999682 },  // Landmark 12
    { x: 0.565488, y: 0.555480, z: -0.581348, visibility: 0.889414 },  // Landmark 13
    { x: 0.546656, y: 0.556752, z: 0.441737, visibility: 0.271178 },  // Landmark 14
    { x: 0.408006, y: 0.579939, z: -0.605583, visibility: 0.878390 },  // Landmark 15
    { x: 0.413229, y: 0.584642, z: 0.059448, visibility: 0.479112 },  // Landmark 16
    { x: 0.373890, y: 0.593915, z: -0.680552, visibility: 0.876155 },  // Landmark 17
    { x: 0.376046, y: 0.593707, z: 0.015618, visibility: 0.574198 },  // Landmark 18
    { x: 0.367223, y: 0.577514, z: -0.673529, visibility: 0.879911 },  // Landmark 19
    { x: 0.366566, y: 0.582899, z: -0.060061, visibility: 0.577684 },  // Landmark 20
    { x: 0.381066, y: 0.572883, z: -0.595770, visibility: 0.843903 },  // Landmark 21
    { x: 0.382088, y: 0.578380, z: 0.013273, visibility: 0.544171 },  // Landmark 22
    { x: 0.663836, y: 0.649087, z: -0.283946, visibility: 0.999812 },  // Landmark 23
    { x: 0.594076, y: 0.650705, z: 0.283662, visibility: 0.999769 },  // Landmark 24
    { x: 0.575634, y: 0.790968, z: -0.499194, visibility: 0.946680 },  // Landmark 25
    { x: 0.450466, y: 0.803648, z: 0.061592, visibility: 0.722701 },  // Landmark 26
    { x: 0.753837, y: 0.955069, z: -0.341417, visibility: 0.934243 },  // Landmark 27
    { x: 0.548669, y: 0.958709, z: 0.235439, visibility: 0.760468 },  // Landmark 28
    { x: 0.796434, y: 0.978408, z: -0.336839, visibility: 0.801056 },  // Landmark 29
    { x: 0.590550, y: 0.977873, z: 0.244667, visibility: 0.725744 },  // Landmark 30
    { x: 0.685535, y: 1.005061, z: -0.609400, visibility: 0.932008 },  // Landmark 31
    { x: 0.427404, y: 0.996208, z: 0.057483, visibility: 0.785197 },  // Landmark 32
  ],
  // RELEASE - Frame 185 (6.17s)
  [
    { x: 0.543426, y: 0.375373, z: -0.156292, visibility: 0.999864 },  // Landmark 0
    { x: 0.559311, y: 0.358812, z: -0.168471, visibility: 0.999752 },  // Landmark 1
    { x: 0.568986, y: 0.357553, z: -0.168962, visibility: 0.999738 },  // Landmark 2
    { x: 0.577995, y: 0.356600, z: -0.168908, visibility: 0.999773 },  // Landmark 3
    { x: 0.539259, y: 0.360513, z: -0.098927, visibility: 0.999801 },  // Landmark 4
    { x: 0.534766, y: 0.360579, z: -0.099679, visibility: 0.999820 },  // Landmark 5
    { x: 0.530982, y: 0.360369, z: -0.100044, visibility: 0.999850 },  // Landmark 6
    { x: 0.610300, y: 0.359510, z: -0.129856, visibility: 0.999757 },  // Landmark 7
    { x: 0.551948, y: 0.363196, z: 0.182977, visibility: 0.999595 },  // Landmark 8
    { x: 0.567383, y: 0.384849, z: -0.128906, visibility: 0.999623 },  // Landmark 9
    { x: 0.544393, y: 0.388094, z: -0.043511, visibility: 0.999565 },  // Landmark 10
    { x: 0.645941, y: 0.426843, z: -0.293334, visibility: 0.999944 },  // Landmark 11
    { x: 0.618787, y: 0.439185, z: 0.505389, visibility: 0.999442 },  // Landmark 12
    { x: 0.547202, y: 0.527703, z: -0.436326, visibility: 0.919073 },  // Landmark 13
    { x: 0.633229, y: 0.552366, z: 0.541135, visibility: 0.208446 },  // Landmark 14
    { x: 0.380787, y: 0.568350, z: -0.452350, visibility: 0.910445 },  // Landmark 15
    { x: 0.616784, y: 0.634074, z: 0.262556, visibility: 0.355913 },  // Landmark 16
    { x: 0.341830, y: 0.577295, z: -0.533457, visibility: 0.907933 },  // Landmark 17
    { x: 0.613676, y: 0.660759, z: 0.230949, visibility: 0.429685 },  // Landmark 18
    { x: 0.334329, y: 0.569651, z: -0.505048, visibility: 0.910680 },  // Landmark 19
    { x: 0.603137, y: 0.660043, z: 0.172596, visibility: 0.432400 },  // Landmark 20
    { x: 0.350691, y: 0.566815, z: -0.434724, visibility: 0.882329 },  // Landmark 21
    { x: 0.606719, y: 0.649355, z: 0.227094, visibility: 0.409802 },  // Landmark 22
    { x: 0.666822, y: 0.648092, z: -0.268977, visibility: 0.999841 },  // Landmark 23
    { x: 0.597415, y: 0.649531, z: 0.268648, visibility: 0.999776 },  // Landmark 24
    { x: 0.634061, y: 0.795605, z: -0.422367, visibility: 0.959663 },  // Landmark 25
    { x: 0.454674, y: 0.804759, z: 0.096252, visibility: 0.770983 },  // Landmark 26
    { x: 0.806231, y: 0.957465, z: -0.286618, visibility: 0.949666 },  // Landmark 27
    { x: 0.552157, y: 0.956162, z: 0.259651, visibility: 0.806433 },  // Landmark 28
    { x: 0.849125, y: 0.978530, z: -0.286914, visibility: 0.837012 },  // Landmark 29
    { x: 0.592591, y: 0.976540, z: 0.266661, visibility: 0.772677 },  // Landmark 30
    { x: 0.765667, y: 1.005265, z: -0.552481, visibility: 0.946438 },  // Landmark 31
    { x: 0.431711, y: 0.990905, z: 0.082754, visibility: 0.824692 },  // Landmark 32
  ],
  // FOLLOW_THROUGH - Frame 210 (7.00s)
  [
    { x: 0.550624, y: 0.367214, z: -0.692060, visibility: 0.999593 },  // Landmark 0
    { x: 0.569677, y: 0.353795, z: -0.666614, visibility: 0.999210 },  // Landmark 1
    { x: 0.581506, y: 0.354254, z: -0.667264, visibility: 0.999272 },  // Landmark 2
    { x: 0.592652, y: 0.354755, z: -0.667087, visibility: 0.999427 },  // Landmark 3
    { x: 0.539839, y: 0.351954, z: -0.641797, visibility: 0.999023 },  // Landmark 4
    { x: 0.530518, y: 0.351320, z: -0.642473, visibility: 0.999030 },  // Landmark 5
    { x: 0.520762, y: 0.350746, z: -0.642909, visibility: 0.998967 },  // Landmark 6
    { x: 0.610353, y: 0.360710, z: -0.394688, visibility: 0.999693 },  // Landmark 7
    { x: 0.515764, y: 0.353402, z: -0.336382, visibility: 0.997958 },  // Landmark 8
    { x: 0.567675, y: 0.382073, z: -0.602081, visibility: 0.999518 },  // Landmark 9
    { x: 0.530834, y: 0.380196, z: -0.574273, visibility: 0.999063 },  // Landmark 10
    { x: 0.678646, y: 0.453461, z: -0.301573, visibility: 0.999889 },  // Landmark 11
    { x: 0.419764, y: 0.413486, z: -0.119379, visibility: 0.998993 },  // Landmark 12
    { x: 0.694524, y: 0.561683, z: -0.763599, visibility: 0.971993 },  // Landmark 13
    { x: 0.282621, y: 0.374238, z: -0.346571, visibility: 0.714933 },  // Landmark 14
    { x: 0.628253, y: 0.482025, z: -1.432417, visibility: 0.974733 },  // Landmark 15
    { x: 0.171794, y: 0.284867, z: -0.750873, visibility: 0.745187 },  // Landmark 16
    { x: 0.608977, y: 0.453984, z: -1.580720, visibility: 0.970811 },  // Landmark 17
    { x: 0.137872, y: 0.258372, z: -0.852600, visibility: 0.750974 },  // Landmark 18
    { x: 0.611196, y: 0.440436, z: -1.584561, visibility: 0.970212 },  // Landmark 19
    { x: 0.151090, y: 0.249247, z: -0.903174, visibility: 0.745541 },  // Landmark 20
    { x: 0.606327, y: 0.453600, z: -1.447571, visibility: 0.948565 },  // Landmark 21
    { x: 0.161105, y: 0.259107, z: -0.786228, visibility: 0.732077 },  // Landmark 22
    { x: 0.560054, y: 0.663970, z: -0.047641, visibility: 0.999719 },  // Landmark 23
    { x: 0.397969, y: 0.658477, z: 0.047010, visibility: 0.999608 },  // Landmark 24
    { x: 0.616799, y: 0.811492, z: -0.347856, visibility: 0.973940 },  // Landmark 25
    { x: 0.298403, y: 0.826926, z: 0.136885, visibility: 0.872502 },  // Landmark 26
    { x: 0.638842, y: 0.962748, z: -0.085174, visibility: 0.983975 },  // Landmark 27
    { x: 0.296232, y: 0.911843, z: 0.851532, visibility: 0.932408 },  // Landmark 28
    { x: 0.626778, y: 0.979044, z: -0.077006, visibility: 0.893951 },  // Landmark 29
    { x: 0.318574, y: 0.919150, z: 0.909630, visibility: 0.849298 },  // Landmark 30
    { x: 0.649925, y: 1.021579, z: -0.441550, visibility: 0.976684 },  // Landmark 31
    { x: 0.226765, y: 0.980830, z: 0.677319, visibility: 0.907173 },  // Landmark 32
  ],];

// Interpolate between keyframes to generate smooth motion
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
