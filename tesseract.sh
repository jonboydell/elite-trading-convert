#!/bin/bash
sudo apt-get -y update
sudo apt-get -y upgrade
sudo apt-get -y install gcc g++ make
sudo apt-get -y install build-essential libtool autoconf
sudo apt-get -y install libpng12-dev
sudo apt-get -y install libjpeg62-dev
sudo apt-get -y install libtiff4-dev
sudo apt-get -y install zlib1g-dev
sudo apt-get -y install libicu-dev
sudo apt-get -y install libpango1.0-dev
sudo apt-get -y install libcairo2-dev
wget http://www.leptonica.com/source/leptonica-1.72.tar.gz
tar -xzvf leptonica-1.72.tar.gz
wget https://github.com/tesseract-ocr/tesseract/archive/3.04.00.tar.gz
tar -xzvf 3.04.00.tar.gz
