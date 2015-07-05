import numpy as np

#x = [1,2,3,4]
#y = [1,2,1,1]

x = np.array([0.0, 1.0, 2.0, 3.0,  4.0,  5.0])
y = np.array([0.0, 0.8, 0.9, 0.1, -0.8, -1.0])

z = np.polyfit(x, y, 3)
print z

p = np.poly1d(z)
p30 = np.poly1d(np.polyfit(x, y, 30))
print "P3: ",p
print "P30",p
print p(5)


import matplotlib.pyplot as plt
xp = np.linspace(-2, 6, 100)
_ = plt.plot(x, y, '.', xp, p(xp), '-', xp, p30(xp), '--')
plt.ylim(-2,2)
plt.show()
