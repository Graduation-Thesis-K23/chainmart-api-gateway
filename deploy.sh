echo "START EXECUTE SCRIPT"

sudo chmod 777 /var/run/docker.sock
sudo aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 376597958889.dkr.ecr.ap-southeast-1.amazonaws.com

sudo docker compose stop
sudo docker compose rm -f
sudo docker system prune -f -a
sudo docker compose up -d

echo "DONE EXECUTE SCRIPT"