import pylab as P

def main():
    logfile = open('testlog.txt','r')
    columns = ['servertime', 'clienttime', 'player', 'position', 'lag', 'lastknown', 'predictor', 'prediction']
    predictors = ["None", "Linear", "Weighted", "polynomial", "scaledpoly"]
    player1 = {'posx':[], 'posy':[]}
    player2 = {'posx':[], 'posy':[]}
    linecount = 0

    for line in logfile:
        linecount += 1
        #line = line.replace('undefined', '0,0,0')
        line = line.split(';')
        print line[3]
        player = int(line[2])

        if (player == 0):
            if line[3] == 'undefined':
                print "silly undefined"
                player1['posx'].append(player1['posx'][-1])
                player1['posy'].append(player1['posy'][-1])
            else:
                position = [int(round(float(x),0)) for x in line[3].split(",")]
                player1['posx'].append(position[0])
                player1['posy'].append(position[1])
        if player == 1:
            if line[3] == 'undefined':
                print "silly undefined"
                player2['posx'].append(player2['posx'][-1])
                player2['posy'].append(player2['posy'][-1])
            else:
                position = [int(round(float(x),0)) for x in line[3].split(",")]
                player2['posx'].append(position[0])
                player2['posy'].append(position[1])


        for idx, elem in enumerate(line):
            if elem == 'undefined':
                print "line", linecount,"player", line[2], columns[idx], " undefined"

    print "p1", len(player1['posx'])
    print "p2", len(player2['posx'])
    plotpositions(player1, player2)

def plotpositions(p1, p2):
    P.plot(p1['posx'], p1['posy'], label='Player 1', linewidth=2)
    P.plot(p2['posx'], p2['posy'], label='Player 1', linewidth=2)

    #P.axis([0, 10, 0, 10])
    P.legend()
    P.show()
    P.figure()

if __name__=='__main__':
    main()
